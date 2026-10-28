import axios from "axios";
const Category = require("../../models/category.model");

interface QueryContextOptions {
  limit?: number;
  format?: string;
}

type UiAction = {
  type: "link" | "api";
  label: string;
  href?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  apiPath?: string;
};

type UiCard =
  | {
      type: "book";
      id: string;
      title: string;
      author?: string;
      image?: string;
      price?: number;
      rating?: number;
      slug?: string;
      href?: string;
    }
  | {
      type: "info";
      title: string;
      description?: string;
      href?: string;
    };

type AiStructuredResponse = {
  message: string;
  intent:
    | "books_search"
    | "books_recommend"
    | "book_detail"
    | "cart"
    | "order"
    | "payment"
    | "auth_login"
    | "auth_register"
    | "general_help"
    | "general_chat"
    | "out_of_scope";
  actions?: UiAction[];
  cards?: UiCard[];
};

function stripCodeFences(raw: string) {
  if (!raw) return raw;
  let s = raw.trim();
  // Remove leading/trailing backticks fences like ```json ... ```
  s = s
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  // Some models add a trailing single backtick by mistake
  s = s.replace(/`+$/g, "").trim();
  return s;
}

function extractFirstJsonObject(raw: string) {
  const s = stripCodeFences(raw);
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return s.slice(start, end + 1);
}

function safeJsonParse<T>(input: string): T | null {
  const direct = stripCodeFences(input);
  const candidate = direct.startsWith("{")
    ? direct
    : extractFirstJsonObject(direct);
  if (!candidate) return null;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

function detectIntent(questionRaw: string): AiStructuredResponse["intent"] {
  const q = normalizeForSearch(questionRaw);
  if (/(dang nhap|login|log in)/.test(q)) return "auth_login";
  if (/(dang ky|register|sign up)/.test(q)) return "auth_register";
  if (/(gio hang|cart|them vao gio|xoa khoi gio|trong gio)/.test(q)) return "cart";
  if (/(don hang|order|trang thai don|huy don|mua gi|da mua)/.test(q)) return "order";
  if (/(thanh toan|payment|vnpay|momo|cod|chuyen khoan)/.test(q)) return "payment";
  if (/(danh gia|review|nhan xet|khen|che|moi nguoi noi|sao)/.test(q)) return "general_help";
  if (/(goi y|recommend|de xuat|nen doc|co sach nao ve|sach nao ve)/.test(q)) return "books_recommend";
  if (/(tim|search|kiem|sach|book)/.test(q)) return "books_search";
  if (/^(hi|hello|hey|xin chao|chao|chao ban|tam biet|bye|cam on|thanks|thank you|ok|okay|vang|da|dung|sai)$/.test(q)) return "general_chat";
  return "general_help";
}

function buildDefaultActions(
  intent: AiStructuredResponse["intent"],
  hasBooks: boolean = false,
): UiAction[] {
  switch (intent) {
    case "books_search":
    case "books_recommend":
    case "book_detail":
      // If no books found, show "View More" button to /books
      if (!hasBooks) {
        return [{ type: "link", label: "Xem thêm", href: "/books" }];
      }
      return [{ type: "link", label: "Xem danh sách sách", href: "/books" }];
    case "cart":
      return [
        { type: "link", label: "Mở giỏ hàng", href: "/cart" },
        { type: "link", label: "Tiếp tục mua sắm", href: "/books" },
      ];
    case "order":
      return [{ type: "link", label: "Xem đơn hàng của tôi", href: "/orders" }];
    case "payment":
      return [
        { type: "link", label: "Đi tới thanh toán", href: "/cart/checkout" },
        { type: "link", label: "Xem đơn hàng", href: "/orders" },
      ];
    case "auth_login":
      return [
        { type: "link", label: "Đăng nhập", href: "/auth/login" },
        { type: "link", label: "Đăng ký", href: "/auth/register" },
      ];
    case "auth_register":
      return [
        { type: "link", label: "Đăng ký", href: "/auth/register" },
        { type: "link", label: "Đăng nhập", href: "/auth/login" },
      ];
    case "general_help":
      return [{ type: "link", label: "Khám phá tủ sách", href: "/books" }];
    case "general_chat":
      return [];
    default:
      return [{ type: "link", label: "Xem sách", href: "/books" }];
  }
}

function buildBookCards(books: any[]): UiCard[] {
  if (!Array.isArray(books) || books.length === 0) return [];
  return books.filter(Boolean).map((book: any) => ({
    type: "book",
    id: String(book._id ?? book.id ?? ""),
    title: book.title,
    author: book.author,
    image: book.image,
    price: book.priceBuy,
    rating: book.rating,
    slug: book.slug,
    href: book.slug ? `/books/detail/${book.slug}` : undefined,
  }));
}

function filterToRelatedBookCards(
  cards: UiCard[] | undefined,
  relatedBooks: any[],
) {
  if (!Array.isArray(cards) || cards.length === 0) return [];
  const allowedIds = new Set(
    (Array.isArray(relatedBooks) ? relatedBooks : [])
      .filter(Boolean)
      .map((b: any) => String(b._id ?? b.id ?? ""))
      .filter((id: string) => id),
  );

  return cards.filter((c) => {
    if (!c || c.type !== "book") return true;
    if (!c.id) return false;
    return allowedIds.has(String(c.id));
  });
}

function normalizeForSearch(input: string) {
  return (input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywords(raw: string) {
  const stopWords = new Set([
    "a", "an", "the", "of", "is", "are", "do", "does", "there", "any", "have",
    "co", "khong", "ko", "nao", "gi", "ve", "minh", "toi", "ban", "cho", "xin", "voi",
    "la", "hay", "can", "muon", "mot", "nhung", "cac", "duoc", "giup", "nhe",
    "nhi", "vay", "sao", "tai", "de", "lam", "hoc", "hoi", "tim", "kiem", "sach",
    "book", "books", "goi", "y", "recommend", "de", "xuat", "tu", "cua", "nguoi",
    "nay", "kia", "cho", "biet", "xem", "voi", "about", "for", "to", "and", "what",
    "which", "who", "can", "you", "me", "please", "find", "looking", "some",
  ]);
  const words = (raw || "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2 && !stopWords.has(normalizeForSearch(word)));

  return {
    keywords: Array.from(new Set(words)).slice(0, 6),
    searchQuery: words.slice(0, 6).join(" "),
  };
}

function buildSlugRegexFromQuery(query: string) {
  const norm = normalizeForSearch(query);
  if (!norm) return null;
  // turn "sach mon an" -> /sach.*mon.*an/i to match slugs like "sach-mon-an-ngon"
  const parts = norm.split(" ").filter(Boolean).slice(0, 6);
  if (parts.length === 0) return null;
  const pattern = parts
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(pattern, "i");
}

function parseMoneyVnd(raw: string) {
  // supports: 100k, 100000, 1tr, 1 triệu, 1.2tr
  const s = (raw || "").toLowerCase().replace(/\s+/g, " ").trim();
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngan|tr|triệu|trieu)?/i);
  if (!m) return null;
  const num = parseFloat(String(m[1]).replace(",", "."));
  if (Number.isNaN(num)) return null;
  const unit = (m[2] || "").toLowerCase();
  if (unit === "k" || unit === "nghìn" || unit === "ngan")
    return Math.round(num * 1_000);
  if (unit === "tr" || unit === "triệu" || unit === "trieu")
    return Math.round(num * 1_000_000);
  // default assume VND if number is already large, otherwise treat as VND
  return Math.round(num);
}

function parseBookFilters(query: string) {
  const q = normalizeForSearch(query);
  const featured = /(noi bat|featured)/.test(q) ? true : undefined;
  const bestSeller = /(ban chay|best seller|hot)/.test(q) ? true : undefined;
  const newest = /(moi nhat|newest|moi ra)/.test(q) ? true : undefined;
  const highRating = /(danh gia cao|rating cao|review tot|5 sao|4\.5)/.test(q) ? true : undefined;

  let priceMin: number | undefined;
  let priceMax: number | undefined;
  const between = q.match(/tu\s+([^ ]+)\s+den\s+([^ ]+)/);
  if (between) {
    const a = parseMoneyVnd(between[1]);
    const b = parseMoneyVnd(between[2]);
    if (a != null && b != null) {
      priceMin = Math.min(a, b);
      priceMax = Math.max(a, b);
    }
  }
  const under = q.match(/(duoi|<)\s*([^ ]+)/);
  if (!priceMax && under) priceMax = parseMoneyVnd(under[2]) ?? undefined;
  const over = q.match(/(tren|>=|>)\s*([^ ]+)/);
  if (!priceMin && over) priceMin = parseMoneyVnd(over[2]) ?? undefined;
  if (/(gia re|re)/.test(q) && !priceMax) priceMax = 150_000;

  return { featured, bestSeller, newest, highRating, priceMin, priceMax };
}

function guessCategorySlugsFromQuery(query: string) {
  const q = normalizeForSearch(query);
  const slugs = new Set<string>();
  if (/(lap trinh|programming|coding|developer|javascript|typescript|node|react|python|java|sql|phan mem)/.test(q)) slugs.add("cong-nghe");
  if (/(nau an|mon an|am thuc|cook|recipe|bep|cong thuc|noi tro)/.test(q)) slugs.add("nau-an");
  if (/(trinh tham|bi an|detective|mystery|pha an|toi pham)/.test(q)) slugs.add("trinh-tham");
  if (/(tam ly|psychology|hanh vi|tu duy|cam xuc|thau cam)/.test(q)) slugs.add("tam-ly-hoc");
  if (/(chua lanh|healing|self help|self-help|phat trien ban than|yeu thuong ban than)/.test(q)) {
    slugs.add("tam-ly-hoc");
    slugs.add("ky-nang-song");
  }
  if (/(lich su|su viet|history|trieu dai|co dai|chien tranh)/.test(q)) slugs.add("lich-su");
  if (/(ky nang song|growth|phat trien|giao tiep|ung xu|thoi quen|atomic|habits|dac nhan tam)/.test(q)) slugs.add("ky-nang-song");
  if (/(tieu thuyet|van hoc|truyen ngan|novel|kinh dien|tac pham)/.test(q)) {
    slugs.add("tieu-thuyet");
    if (/(viet nam|trong nuoc)/.test(q)) slugs.add("van-hoc-viet-nam");
    if (/(nuoc ngoai|quoc te|dich)/.test(q)) slugs.add("van-hoc-nuoc-ngoai");
  }
  if (/(kinh te|kinh doanh|marketing|khoi nghiep|quan tri|tai chinh|money|business|startup|ceo|chief executive|leadership|lanh dao|manager|management|entrepreneur|finance)/.test(q)) {
    slugs.add("kinh-te");
    slugs.add("kinh-doanh");
  }
  if (/(thieu nhi|tre em|ehon|co tich|kids|hoc sinh)/.test(q)) slugs.add("thieu-nhi");
  if (/(khoa hoc vien tuong|sci fi|vu tru|thien van|tuong lai)/.test(q)) slugs.add("khoa-hoc-vien-tuong");
  if (/(truyen tranh|manga|comic|anime)/.test(q)) slugs.add("truyen-tranh");
  if (/(giao khoa|tham khao|sgk|luyen thi|on thi)/.test(q)) {
    slugs.add("sach-giao-khoa");
    slugs.add("sach-tham-khao");
  }
  if (/(ngoai ngu|tieng anh|english|tieng nhat|tieng han|hoc tieng)/.test(q)) slugs.add("sach-hoc-ngoai-ngu");
  if (/(nghe thuat|hoi hoa|am nhac|nhiep anh|thiet ke|art)/.test(q)) slugs.add("nghe-thuat");
  if (/(chinh tri|phap luat|luat|hien phap|phap quy)/.test(q)) slugs.add("chinh-tri-phap-luat");
  return Array.from(slugs);
}

/**
 * Service để handle AI queries với Groq API
 */
module.exports.queryAI = async (
  question: string,
  context?: string,
  relatedBooks?: any[],
  history: { role: "user" | "assistant"; content: string; bookIds?: string[] }[] = [],
) => {
  const hasBooks = Array.isArray(relatedBooks) && relatedBooks.length > 0;
  const normalizedQuestion = normalizeForSearch(question);
  const hasBookFollowUp =
    hasBooks &&
    /(may sach|sach tren|nhung sach|nhung cuon|cuon tren|sach do|cuon do|vua goi y|goi y tren|noi ve gi|noi ve cuon|tac gia do|gia cuon do|review cuon do)/.test(
      normalizedQuestion,
    );
  const fallbackIntent: AiStructuredResponse["intent"] = hasBookFollowUp
    ? "book_detail"
    : detectIntent(question);

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY không được cấu hình");
    }

    const systemPrompt = `You are BookHive's conversational assistant. Answer general questions naturally and help customers with books, their cart, orders, payments, and store policies.

LANGUAGE AND TONE
- Reply in the same language as the customer's latest message. Use natural, concise Vietnamese when they write Vietnamese; use natural English when they write English.
- Answer the actual question directly and conversationally. Do not force a book recommendation into greetings or unrelated questions.
- Use the conversation history to understand references such as "those books", "the one you mentioned", "mấy cuốn trên", or "cuốn đó". Treat the latest message as a follow-up when it refers to earlier turns.
- For general knowledge questions, answer from your general knowledge. Use the supplied store context as the source of truth for BookHive's catalog, prices, stock, orders, cart, reviews, and policies.

GROUNDING AND RECOMMENDATIONS
- Treat the supplied REAL BOOK CATALOG as the only source of truth for inventory, titles, authors, prices, ratings, availability, and book descriptions. Never invent or substitute titles.
- Recommend only catalog books whose title, author, category, or description clearly matches the requested subject. Popularity alone is not relevance.
- If the customer asks whether a specific title exists and it is absent from the catalog, say that the exact title was not found. Offer alternatives only if the catalog shows they match the same subject.
- If no catalog result matches the request, say so clearly. Do not fill the answer or cards with unrelated books.
- Do not claim personal purchases, stock, delivery, discounts, policies, or review details unless those facts appear in the context.
- Never expose private account information beyond what is needed to answer that customer's question.

RESPONSE FORMAT
Return one valid JSON object only, with this shape:
{
  "message": "A direct, helpful answer in the customer's language",
  "intent": "books_search | books_recommend | book_detail | cart | order | payment | auth_login | auth_register | general_help | general_chat | out_of_scope",
  "actions": []
}
Use only supported action objects with type, label, and a local href when useful. Do not include markdown fences or extra text outside the JSON object.`;

    const conversation = history
      .slice(-10)
      .map((turn) => `${turn.role === "user" ? "Customer" : "Assistant"}: ${turn.content}`)
      .join("\n");
    const userContent = [
      conversation ? `Lịch sử hội thoại gần đây:\n${conversation}` : "",
      `Câu hỏi mới nhất của khách: ${question}`,
      context ? `Thông tin cửa hàng và dữ liệu liên quan:\n${context}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const models = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "llama3-70b-8192",
      "mixtral-8x7b-32768",
      "gemma2-9b-it",
    ];

    let response: any = null;
    let lastError: any = null;

    for (const model of models) {
      try {
        response = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
            max_tokens: 800,
            temperature: 0.25,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            timeout: 10000,
          },
        );
        if (response?.data?.choices?.[0]?.message?.content) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.log(`Groq model ${model} failed, trying next model...`);
      }
    }

    if (!response?.data?.choices?.[0]?.message?.content) {
      throw lastError || new Error("Tất cả mô hình AI đều không khả dụng.");
    }

    const raw = response.data?.choices?.[0]?.message?.content;
    const parsed = safeJsonParse<AiStructuredResponse>(raw.trim());

    // Build structured response - use AI message if properly parsed
    let message = "";
    let intent = fallbackIntent;
    let actions: UiAction[] = [];

    if (parsed?.message) {
      message = parsed.message;
      intent = parsed.intent || fallbackIntent;
      actions =
        Array.isArray(parsed.actions) && parsed.actions.length > 0
          ? parsed.actions
          : buildDefaultActions(intent, hasBooks);
    } else {
      if (raw && raw.length > 10) {
        message = raw.replace(/```json|```/g, "").trim();
      } else {
        message =
          "Xin chào! Book Hive rất vui được hỗ trợ bạn giải đáp thắc mắc về sách.";
      }
      intent = fallbackIntent;
      actions = buildDefaultActions(fallbackIntent, hasBooks);
    }

    // Keep clear greetings and references to earlier recommendations in their
    // conversational intent even if the model guesses another intent.
    if (hasBookFollowUp) {
      intent = "book_detail";
    } else if (fallbackIntent === "general_chat") {
      intent = "general_chat";
      actions = [];
      relatedBooks = [];
    }

    // Only show catalog cards for book-related questions; never attach unrelated
    // recommendations to account, order, payment, or general conversation replies.
    const bookIntents = new Set(["books_search", "books_recommend", "book_detail"]);
    if (!bookIntents.has(intent)) relatedBooks = [];

    // Sync cards with message content
    const msgLower = message.toLowerCase();
    let finalCards: UiCard[] = (relatedBooks || [])
      .filter((book: any) => {
        const title = (book.title || "").toLowerCase();
        if (title.length < 3) return false;
        return msgLower.includes(title);
      })
      .map((book: any) => ({
        type: "book",
        id: String(book._id ?? book.id ?? ""),
        title: book.title,
        author: book.author,
        image: book.image,
        price: book.priceBuy,
        rating: book.rating,
        slug: book.slug,
        href: book.slug ? `/books/detail/${book.slug}` : undefined,
      }));

    if (finalCards.length === 0 && hasBooks) {
      finalCards = (relatedBooks || []).slice(0, 4).map((book: any) => ({
        type: "book",
        id: String(book._id ?? book.id ?? ""),
        title: book.title,
        author: book.author,
        image: book.image,
        price: book.priceBuy,
        rating: book.rating,
        slug: book.slug,
        href: book.slug ? `/books/detail/${book.slug}` : undefined,
      }));
    }

    const structured: AiStructuredResponse = {
      message,
      intent,
      actions,
      cards: finalCards,
    };

    return {
      success: true,
      answer: structured.message,
      ui: structured,
      context_used: !!context,
    };
  } catch (error: any) {
    console.error("AI Service Error:", error.response?.data || error.message);

    // Fallback response when AI provider is completely unavailable
    let fallbackMessage = "Chào bạn! Book Hive sẵn sàng hỗ trợ bạn tìm sách và giải đáp thắc mắc.";
    const isBookIntent = ["books_search", "books_recommend", "book_detail"].includes(fallbackIntent);
    if (hasBookFollowUp) {
      const summaries = (relatedBooks || [])
        .slice(0, 4)
        .map((book: any) => {
          const description = String(book.description || "")
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 320);
          return description ? `“${book.title}”: ${description}` : `“${book.title}” (chưa có mô tả trong kho sách)`;
        })
        .join("\n\n");
      fallbackMessage = `Các cuốn sách bạn vừa hỏi nói về:\n\n${summaries}`;
    } else if (fallbackIntent === "general_chat") {
      fallbackMessage = "Chào bạn! Mình có thể trò chuyện cùng bạn, tìm sách theo chủ đề hoặc giúp tra cứu thông tin cửa hàng. Bạn cần gì nè?";
    } else if (isBookIntent && hasBooks) {
      const bookNames = (relatedBooks || [])
        .slice(0, 3)
        .map((book: any) => `"${book.title}"`)
        .join(", ");
      fallbackMessage = `Mình tìm được một vài cuốn phù hợp trong kho: ${bookNames}. Bạn có thể xem thông tin bên dưới.`;
    } else if (isBookIntent) {
      fallbackMessage = "Mình chưa tìm thấy sách khớp với chủ đề hoặc tựa sách này trong kho hiện tại. Bạn thử từ khóa khác hoặc duyệt danh mục sách nhé.";
    }
    const fallbackCards: UiCard[] = (isBookIntent ? relatedBooks || [] : []).map((book: any) => ({
      type: "book",
      id: String(book._id ?? book.id ?? ""),
      title: book.title,
      author: book.author,
      image: book.image,
      price: book.priceBuy,
      rating: book.rating,
      slug: book.slug,
      href: book.slug ? `/books/detail/${book.slug}` : undefined,
    }));

    const fallbackUi: AiStructuredResponse = {
      message: fallbackMessage,
      intent: fallbackIntent,
      actions: buildDefaultActions(fallbackIntent, hasBooks),
      cards: fallbackCards,
    };

    return {
      success: true,
      answer: fallbackMessage,
      ui: fallbackUi,
      context_used: false,
    };
  }
};

/**
 * Tìm các cuốn sách liên quan dựa trên keyword
 */
module.exports.findRelatedBooks = async (
  Book: any,
  query: string,
  options: QueryContextOptions = {},
) => {
  try {
    if (detectIntent(query) === "general_chat") return [];

    const limit = options.limit || 5;
    const { keywords } = extractKeywords(query);
    const filters = parseBookFilters(query);
    const guessedCategorySlugs = guessCategorySlugsFromQuery(query);
    const baseFind: any = { deleted: false, status: "active" };

    if (filters.featured) baseFind.featured = true;
    if (filters.newest) baseFind.newest = true;
    if (filters.priceMin != null || filters.priceMax != null) {
      baseFind.priceBuy = {};
      if (filters.priceMin != null) baseFind.priceBuy.$gte = filters.priceMin;
      if (filters.priceMax != null) baseFind.priceBuy.$lte = filters.priceMax;
    }
    if (filters.highRating) baseFind.rating = { $gte: 4.5 };

    const sort: any = {};
    if (filters.bestSeller) sort.soldCount = -1;
    if (filters.featured) sort.featured = -1;
    if (filters.newest) sort.createdAt = -1;
    if (filters.highRating) sort.rating = -1;
    if (Object.keys(sort).length === 0) {
      sort.soldCount = -1;
      sort.featured = -1;
      sort.createdAt = -1;
    }

    // Explicit catalog filters such as best sellers should not be mixed with keyword matches.
    if (filters.bestSeller || filters.featured || filters.newest || filters.highRating) {
      const filteredBooks = await Book.find(baseFind).sort(sort).limit(limit);
      return filteredBooks;
    }

    // Prefer a title or author containing every meaningful query term.
    const meaningfulTerms = keywords.filter((word: string) => word.length >= 2).slice(0, 4);
    if (meaningfulTerms.length > 0) {
      const exactTerms = meaningfulTerms.map((word: string) => {
        const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        return { $or: [{ title: regex }, { author: regex }] };
      });
      const titleMatches = await Book.find({ ...baseFind, $and: exactTerms })
        .sort(sort)
        .limit(limit);
      if (titleMatches.length > 0) return titleMatches;
    }

    // If the user asks about a subject, only recommend books in its matching category.
    if (guessedCategorySlugs.length > 0) {
      const categories = await Category.find({
        deleted: false,
        status: "active",
        slug: { $in: guessedCategorySlugs },
      }).select("_id slug");
      const categoryIds = categories
        .map((category: any) => String(category._id ?? ""))
        .filter(Boolean);

      if (categoryIds.length > 0) {
        const categoryBooks = await Book.find({
          ...baseFind,
          category_id: { $in: categoryIds },
        })
          .sort(sort)
          .limit(limit);
        if (categoryBooks.length > 0) return categoryBooks;
      }
    }

    // For a general keyword search, require every meaningful term to match somewhere
    // in the book metadata. A single common word must not pull unrelated books in.
    if (meaningfulTerms.length > 0) {
      const termConditions = meaningfulTerms.map((word: string) => {
        const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        return {
          $or: [
            { title: regex },
            { author: regex },
            { description: regex },
            { slug: regex },
          ],
        };
      });
      const matchingBooks = await Book.find({ ...baseFind, $and: termConditions })
        .sort(sort)
        .limit(limit);
      if (matchingBooks.length > 0) return matchingBooks;
    }

    // Only use popular books for genuinely broad requests, never as a fallback
    // for a specific topic or title that was not found.
    if (meaningfulTerms.length === 0) {
      return Book.find({ deleted: false, status: "active" })
        .sort({ soldCount: -1, featured: -1, createdAt: -1 })
        .limit(limit);
    }

    return [];
  } catch (error: any) {
    console.error("Error finding related books:", error.message);
    return [];
  }
};
/**
 * Build context string đa tầng (Version 7)
 */
module.exports.buildContext = (books: any[], options: any = {}) => {
  const { orders = [], reviews = [], cart = null, user = null } = options;
  const sections: string[] = [];

  sections.push(`STORE POLICIES:\n- Delivery: free within Ho Chi Minh City for orders above 300,000 VND; nationwide delivery is usually 1-3 days.\n- Payment methods: COD, bank transfer, MoMo, and VNPAY. Returns are accepted within 7 days for manufacturing defects.`);

  if (user) {
    sections.push(`SIGNED-IN CUSTOMER:\n- Name: ${user.fullName || "Not provided"}\n- Email: ${user.email || "Not provided"}`);
  }

  if (cart?.items?.length) {
    sections.push(`CURRENT CART (not yet purchased):\n${cart.items
      .map((item: any) => `- ${item.title} (quantity: ${item.quantity}, price: ${item.price} VND)`)
      .join("\n")}`);
  }

  if (orders.length) {
    sections.push(`RECENT ORDERS:\n${orders
      .map((order: any) => `- Order ${order.orderCode}: status ${order.status}, total ${order.totalAmount} VND, date ${order.createdAt}`)
      .join("\n")}`);
  }

  if (reviews.length) {
    sections.push(`CUSTOMER REVIEWS:\n${reviews
      .map((review: any) => `- Book: ${review.book?.title || "Unknown"}; rating: ${review.rating}/5; review: "${review.comment || "No written comment"}"`)
      .join("\n")}`);
  }

  if (books?.length) {
    const catalog = books.map((book: any, index: number) => {
      const description = String(book.description || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 220);
      return `BOOK ${index + 1}:\n- ID: ${book._id}\n- Title: ${book.title}\n- Author: ${book.author || "Unknown"}\n- Category: ${book.category_name || book.category || "Not specified"}\n- Price: ${book.priceBuy ?? "Not specified"} VND\n- Rating: ${book.rating ?? "Not rated"}/5\n- Sold: ${book.soldCount ?? 0}\n- Description: ${description || "No description"}`;
    });
    sections.push(`REAL BOOK CATALOG (database matches for this request):\n${catalog.join("\n\n")}`);
  } else {
    sections.push("REAL BOOK CATALOG: No matching books were found in the store database. Do not invent titles or suggest unrelated books.");
  }

  return sections.join("\n\n");
};
export {};
