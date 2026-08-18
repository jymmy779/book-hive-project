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
  const q = (questionRaw || "").toLowerCase();
  if (/(đăng\s*nhập|login|log\s*in)/i.test(q)) return "auth_login";
  if (/(đăng\s*ký|register|sign\s*up)/i.test(q)) return "auth_register";
  if (
    /(giỏ\s*hàng|cart|thêm\s*vào\s*giỏ|xóa\s*khỏi\s*giỏ|trong\s*giỏ)/i.test(q)
  )
    return "cart";
  if (
    /(đơn\s*hàng|order|trạng\s*thái\s*đơn|hủy\s*đơn|mua\s*gì|đã\s*mua)/i.test(q)
  )
    return "order";
  if (/(thanh\s*toán|payment|vnpay|momo|cod|chuyển\s*khoản)/i.test(q))
    return "payment";
  if (/(đánh\s*giá|review|nhận\s*xét|khen|chê|mọi\s*người\s*nói|sao)/i.test(q))
    return "general_help"; // Will handle via multi-context
  if (/(gợi\s*ý|recommend|đề\s*xuất)/i.test(q)) return "books_recommend";
  if (/(tìm|search|kiếm|sách|book)/i.test(q)) return "books_search";
  if (/(chào|hi|hello|tạm biệt|bye|cảm ơn|thanks|ok|vâng|đúng|sai)/i.test(q))
    return "general_chat";
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
    case "general_chat":
    case "general_help":
      return [{ type: "link", label: "Khám phá tủ sách", href: "/books" }];
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

function extractKeywords(raw: string) {
  const q = (raw || "").trim();
  const lower = q.toLowerCase();
  const stop = new Set([
    "mình",
    "tôi",
    "bạn",
    "cho",
    "xin",
    "nhờ",
    "giúp",
    "với",
    "là",
    "về",
    "có",
    "không",
    "nào",
    "đó",
    "được",
    "một",
    "các",
    "những",
    "sách",
    "book",
    "find",
    "search",
    "tìm",
    "kiếm",
    "gợi",
    "ý",
    "recommend",
    "của",
    "được",
    "mọi",
    "người",
    "đánh",
    "giá",
    "như",
    "nào",
    "thế",
    "nào",
    "gì",
    "đâu",
    "ai",
    "tại",
    "sao",
    "nhỉ",
    "vậy",
    "biết",
    "cho",
    "biết",
    "với",
    "thử",
    "xem",
    "nói",
    "về",
    "văn",
    "học",
    "tác",
    "giả",
  ]);

  const words = lower
    .split(
      /[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/i,
    )
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !stop.has(w));

  const synonyms: Record<string, string[]> = {
    code: ["code", "coding", "lập trình", "programming", "developer", "dev"],
    lập: ["lập trình", "programming", "coding"],
    trình: ["lập trình", "programming", "coding"],
    javascript: [
      "javascript",
      "js",
      "node",
      "nodejs",
      "react",
      "typescript",
      "ts",
    ],
    python: ["python", "django", "flask"],
    java: ["java", "spring"],
    sql: ["sql", "database", "cơ sở dữ liệu", "mysql", "postgres", "mongodb"],
    cook: [
      "nấu ăn",
      "món ăn",
      "ẩm thực",
      "cooking",
      "recipe",
      "cookbook",
      "vào bếp",
      "công thức",
    ],
    children: [
      "thiếu nhi",
      "trẻ em",
      "ehon",
      "truyện tranh",
      "manga",
      "comic",
      "kids",
      "cổ tích",
    ],
    business: [
      "kinh doanh",
      "marketing",
      "khởi nghiệp",
      "quản trị",
      "lãnh đạo",
      "startup",
      "finance",
      "tài chính",
    ],
    history: [
      "lịch sử",
      "sử việt",
      "triều đại",
      "chiến tranh",
      "nhan vat lich su",
      "history",
    ],
    education: [
      "giáo khoa",
      "tham khảo",
      "ngoại ngữ",
      "tiếng anh",
      "ielts",
      "toeic",
      "học tập",
      "sgk",
    ],
    novel: ["tiểu thuyết", "truyện ngắn", "văn học", "tác phẩm", "novel"],
  };

  const expanded = new Set<string>();
  for (const w of words) {
    expanded.add(w);
    for (const vals of Object.values(synonyms)) {
      if (vals.includes(w)) vals.forEach((v) => expanded.add(v));
    }
    if (synonyms[w]) synonyms[w].forEach((v) => expanded.add(v));
  }

  return {
    keywords: Array.from(expanded).slice(0, 12),
    searchQuery: words.slice(0, 6).join(" "),
  };
}

function normalizeForSearch(input: string) {
  // Lowercase + remove Vietnamese diacritics (works for most Latin-based languages)
  return (input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  const q = (query || "").toLowerCase();

  const featured = /(nổi\s*bật|featured)/i.test(q) ? true : undefined;
  const bestSeller = /(bán\s*chạy|best\s*-?\s*seller|hot)/i.test(q)
    ? true
    : undefined;
  const newest = /(mới\s*nhất|newest|mới\s*ra)/i.test(q) ? true : undefined;
  const highRating =
    /(đánh\s*giá\s*cao|rating\s*cao|review\s*tốt|5\s*sao|4\.5)/i.test(q)
      ? true
      : undefined;

  // price filters: "dưới 200k", "trên 100k", "từ 100k đến 300k"
  let priceMin: number | undefined;
  let priceMax: number | undefined;

  const between = q.match(
    /từ\s+([^ ]+(?:\s*(?:k|nghìn|ngan|tr|triệu|trieu)?)?)\s+đến\s+([^ ]+(?:\s*(?:k|nghìn|ngan|tr|triệu|trieu)?)?)/i,
  );
  if (between) {
    const a = parseMoneyVnd(between[1]);
    const b = parseMoneyVnd(between[2]);
    if (a != null && b != null) {
      priceMin = Math.min(a, b);
      priceMax = Math.max(a, b);
    }
  }

  const under = q.match(
    /(dưới|<)\s*([^ ]+(?:\s*(?:k|nghìn|ngan|tr|triệu|trieu)?)?)/i,
  );
  if (!priceMax && under) {
    const v = parseMoneyVnd(under[2]);
    if (v != null) priceMax = v;
  }

  const over = q.match(
    /(trên|>=|>)\s*([^ ]+(?:\s*(?:k|nghìn|ngan|tr|triệu|trieu)?)?)/i,
  );
  if (!priceMin && over) {
    const v = parseMoneyVnd(over[2]);
    if (v != null) priceMin = v;
  }

  // "giá rẻ" heuristic
  if (/(giá\s*rẻ|rẻ)/i.test(q) && !priceMax) priceMax = 150_000;

  return { featured, bestSeller, newest, highRating, priceMin, priceMax };
}

function guessCategorySlugsFromQuery(query: string) {
  const q = normalizeForSearch(query);
  const slugs = new Set<string>();

  // Technology / programming
  if (
    /(lap trinh|programming|coding|code|developer|dev|javascript|typescript|node|react|python|java|sql|it|phan mem)/i.test(
      q,
    )
  ) {
    slugs.add("cong-nghe");
  }

  // Cooking
  if (
    /(nau an|mon an|am thuc|cook|cooking|recipe|bep|cong thuc|noi tro)/i.test(q)
  ) {
    slugs.add("nau-an");
  }

  // Mystery / Detective
  if (
    /(trinh tham|bi an|detective|mystery|pha an|toi pham|trinh sat)/i.test(q)
  ) {
    slugs.add("trinh-tham");
  }

  // Psychology
  if (/(tam ly|psychology|hanh vi|tu duy|cam xuc|thau cam)/i.test(q)) {
    slugs.add("tam-ly-hoc");
  }

  // History
  if (/(lich su|su viet|history|trieu dai|co dai|chien tranh)/i.test(q)) {
    slugs.add("lich-su");
  }

  // Life skills
  if (
    /(ky nang song|growth|phat trien|giao tiep|ung xu|thoi quen|atomic|habits|dac nhan tam)/i.test(
      q,
    )
  ) {
    slugs.add("ky-nang-song");
  }

  // Novels / Literature
  if (/(tieu thuyết|van hoc|truyen ngan|novel|kinh dien|tác phẩm)/i.test(q)) {
    slugs.add("tieu-thuyet");
    if (/(viet nam|trong nuoc)/i.test(q)) slugs.add("van-hoc-viet-nam");
    if (/(nuoc ngoai|quoc te|dich)/i.test(q)) slugs.add("van-hoc-nuoc-ngoai");
  }

  // Business / Marketing
  if (
    /(kinh doanh|marketing|khoi nghiep|quan tri|tai chinh|money|business|startup)/i.test(
      q,
    )
  ) {
    slugs.add("kinh-doanh");
  }

  // Children
  if (/(thieu nhi|tre em|ehon|co tich|kids|hoc sinh)/i.test(q)) {
    slugs.add("thieu-nhi");
  }

  // Sci-Fi
  if (/(khoa hoc vien tuong|sci-fi|vu tru|thien van|tuong lai)/i.test(q)) {
    slugs.add("khoa-hoc-vien-tuong");
  }

  // Comics
  if (/(truyen tranh|manga|comic|anime)/i.test(q)) {
    slugs.add("truyen-tranh");
  }

  // Education / Textbook
  if (/(giao khoa|tham khao|sgk|luyen thi|on thi)/i.test(q)) {
    slugs.add("sach-giao-khoa");
    slugs.add("sach-tham-khao");
  }

  // Languages
  if (/(ngoai ngu|tieng anh|english|tieng nhat|tieng han|hoc tieng)/i.test(q)) {
    slugs.add("sach-hoc-ngoai-ngu");
  }

  // Arts
  if (/(nghe thuat|hoi hoa|am nhac|nhiep anh|thiet ke|art)/i.test(q)) {
    slugs.add("nghe-thuat");
  }

  // Law / Politics
  if (/(chinh tri|phap luat|luat|hien phap|phap quy)/i.test(q)) {
    slugs.add("chinh-tri-phap-luat");
  }

  return Array.from(slugs);
}

/**
 * Service để handle AI queries với Groq API
 */
module.exports.queryAI = async (
  question: string,
  context?: string,
  relatedBooks?: any[],
) => {
  const fallbackIntent = detectIntent(question);
  const hasBooks = Array.isArray(relatedBooks) && relatedBooks.length > 0;

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY không được cấu hình");
    }

    const systemPrompt = `Bạn là BOOK STYLIST - Chuyên gia trợ lý Omni-Assistant cao cấp của BookHive.
Bạn không chỉ tư vấn sách, mà còn là người quản gia tận tâm nắm rõ mọi trạng thái của cửa hàng và khách hàng.

1. KIẾN THỨC TOÀN DIỆN (OMNI-CONTEXT):
- Kiểm tra mục ## TÀI KHOẢN CỦA BẠN: Để biết khách đã mua gì, đơn hàng đang ở tình trạng nào (pending, shipping, delivered) hoặc giỏ hàng có sách gì chưa thanh toán.
- Kiểm tra mục ## ĐÁNH GIÁ CỘNG ĐỒNG: Sử dụng các nhận xét thực tế để tư vấn khách quan. Ví dụ: "Nhiều độc giả khác đánh giá cuốn này 5 sao vì cốt truyện rất lôi cuốn...".
- Kiểm tra mục ## KHO SÁCH: Cung cấp thông tin sản phẩm chính xác.

2. CHIẾN LƯỢC PHẢN HỒI (V7):
- Tra cứu đơn hàng: Nếu khách hỏi về đơn hàng, hãy chủ động tra cứu mã đơn và trạng thái trong context. Nếu chưa có đơn nào, hãy hướng dẫn khách cách mua hàng.
- Giỏ hàng: Nhắc nhở tinh tế nếu khách có món đồ bỏ quên trong giỏ hàng.
- Đánh giá: Ưu tiên dùng các từ ngữ của khách hàng cũ (trong mục Reviews) để tăng sự thuyết phục.
- Persona: Luôn thấu cảm (Empathy), lịch thiệp và mang phong thái một chuyên gia "biết tuốt" về BookHive.

3. QUY TẮC CỐT LÕI:
- ĐỒNG BỘ: Chỉ nhắc tên sách có trong Context. Hệ thống tự hiển thị Card.
- TUYỆT ĐỐI không tự viết danh sách liệt kê sách bằng dấu gạch đầu dòng nếu đã có cards.
- Nếu không tìm thấy thông tin đơn hàng/sách cụ thể, hãy tư vấn dựa trên kiến thức chung của bạn nhưng khéo léo lái về website.

4. FORMAT JSON (BẮT BUỘC):
{
  "message": "Lời thoại của bạn. (Cá nhân hóa + Thấu cảm + Trả lời trực diện câu hỏi)",
  "intent": "books_search | books_recommend | cart | order | payment | general_chat",
  "actions": []
}`;

    const userContent = context
      ? `Câu hỏi: ${question}\n\nThông tin liên quan:\n${context}`
      : `Câu hỏi: ${question}`;

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
            temperature: 0.7,
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
    let fallbackMessage =
      "Xin chào! Book Hive sẵn sàng hỗ trợ bạn tìm kiếm và lựa chọn những cuốn sách hay nhất.";
    if (hasBooks) {
      const bookNames = (relatedBooks || [])
        .slice(0, 3)
        .map((b: any) => `"${b.title}"`)
        .join(", ");
      fallbackMessage = `Book Hive gợi ý cho bạn một số cuốn sách hay phù hợp với nhu cầu: ${bookNames}. Bạn có thể xem chi tiết bên dưới nhé!`;
    }

    const fallbackCards: UiCard[] = (relatedBooks || []).map((book: any) => ({
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
    const limit = options.limit || 5;
    const { keywords } = extractKeywords(query);
    const filters = parseBookFilters(query);

    let books: any[] = [];
    const slugRegex = buildSlugRegexFromQuery(query);
    const guessedCategorySlugs = guessCategorySlugsFromQuery(query);

    const baseFind: any = { deleted: false, status: "active" };
    if (filters.featured) baseFind.featured = true;
    if (filters.newest) baseFind.newest = true;
    if (filters.priceMin != null || filters.priceMax != null) {
      baseFind.priceBuy = {};
      if (filters.priceMin != null) baseFind.priceBuy.$gte = filters.priceMin;
      if (filters.priceMax != null) baseFind.priceBuy.$lte = filters.priceMax;
    }
    if (filters.highRating) {
      baseFind.rating = { $gte: 4.5 };
    }

    let sort: any = {};
    if (filters.bestSeller) sort.soldCount = -1;
    if (filters.featured) sort.featured = -1;
    if (filters.newest) sort.createdAt = -1;
    if (filters.highRating) sort.rating = -1;
    if (Object.keys(sort).length === 0) {
      sort = { soldCount: -1, featured: -1, createdAt: -1 };
    }

    const buildTextOr = (regex: RegExp) => [
      { title: regex },
      { author: regex },
      { description: regex },
      ...(slugRegex ? [{ slug: slugRegex }] : []),
    ];

    // ← THÊM: Pass đặc biệt - nếu detect filter pattern, chỉ apply filter + sort
    if (
      filters.bestSeller ||
      filters.featured ||
      filters.newest ||
      filters.highRating
    ) {
      books = await Book.find(baseFind).sort(sort).limit(limit);
      if (books && books.length > 0) {
        return books;
      }
    }

    // Pass 0: if query strongly implies a category, fetch books by that category first
    if (guessedCategorySlugs.length > 0) {
      const cats = await Category.find({
        deleted: false,
        status: "active",
        slug: { $in: guessedCategorySlugs },
      }).select("_id slug");

      const catIds = (cats || [])
        .map((c: any) => String(c._id ?? ""))
        .filter((id: string) => id);

      if (catIds.length > 0) {
        books = await Book.find({ ...baseFind, category_id: { $in: catIds } })
          .sort(sort)
          .limit(limit);
      }
    }

    // Pass 1.5: Thử tìm kiếm chính xác theo cụm từ (Phrase match) cho cả Tên sách và Tác giả
    if (keywords.length >= 2) {
      const cleanedPhrase = query
        .replace(
          /(sách|book|của|được|tìm|kiếm|đánh giá|nhận xét|review|mọi người|như thế nào|thế nào)/gi,
          "",
        )
        .trim();
      if (cleanedPhrase.length >= 3) {
        const phraseRegex = new RegExp(cleanedPhrase, "i");
        const phraseBooks = await Book.find({
          ...baseFind,
          $or: [{ title: phraseRegex }, { author: phraseRegex }],
        })
          .sort(sort)
          .limit(limit);
        if (phraseBooks.length > 0) return phraseBooks;
      }
    }

    if (keywords.length > 0) {
      const pattern = keywords
        .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");
      const regex = new RegExp(pattern, "i");

      if (!books || books.length === 0) {
        // Search: title, author, description
        books = await Book.find({
          ...baseFind,
          $or: [
            { title: regex },
            { author: regex },
            { description: regex },
            ...(slugRegex ? [{ slug: slugRegex }] : []),
          ],
        })
          .sort(sort)
          .limit(limit);
      }
    } else {
      const regex = new RegExp(query, "i");
      if (!books || books.length === 0) {
        books = await Book.find({
          ...baseFind,
          $or: [
            { title: regex },
            { author: regex },
            { description: regex },
            ...(slugRegex ? [{ slug: slugRegex }] : []),
          ],
        })
          .sort(sort)
          .limit(limit);
      }
    }

    // Pass 2: nếu không ra kết quả do filter quá chặt, thử bỏ filter nhưng giữ từ khóa
    if ((!books || books.length === 0) && keywords.length > 0) {
      const pattern = keywords
        .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");
      const regex = new RegExp(pattern, "i");
      books = await Book.find({
        deleted: false,
        status: "active",
        $or: [{ title: regex }, { author: regex }, { description: regex }],
      })
        .sort({ soldCount: -1, featured: -1, createdAt: -1 })
        .limit(limit);
    }

    // Fallback: chỉ return sách ngẫu nhiên nếu user hỏi chung chung về "sách"
    // Nếu có từ khóa cụ thể mà không tìm thấy -> trả về rỗng để AI biết là shop không có
    if (!books || books.length === 0) {
      const isGeneral =
        !query ||
        keywords.length === 0 ||
        /(sách|book|gợi ý|recommend|truyện)/i.test(query);
      if (isGeneral) {
        books = await Book.find({ deleted: false, status: "active" })
          .sort(sort)
          .limit(limit);
      }
    }

    return books || [];
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

  let context = `## THUẬN TIỆN & CHÍNH SÁCH:
- Giao hàng: Miễn phí nội thành TP.HCM (>300k), 1-3 ngày toàn quốc.
- Thanh toán: COD, Chuyển khoản, MoMo, VNPAY. Đổi trả 7 ngày lỗi SX.
`;

  if (user) {
    context += `\n## CHÀO BẠN:
- Tên khách hàng: ${user.fullName}
- Email: ${user.email}
`;
  }

  if (cart && cart.items && cart.items.length > 0) {
    context += `\n## GIỎ HÀNG CỦA BẠN (Chưa thanh toán):
${cart.items.map((p: any) => `- ${p.title} (SL: ${p.quantity}, Giá: ${p.price}đ)`).join("\n")}
`;
  }

  if (orders && orders.length > 0) {
    context += `\n## TRẠNG THÁI ĐƠN HÀNG GẦN ĐÂY:
${orders
  .map(
    (o: any) =>
      `- Mã: ${o.orderCode}, Trạng thái: ${o.status}, Tổng: ${o.totalAmount}đ (Ngày mua: ${o.createdAt})`,
  )
  .join("\n")}
`;
  }

  if (reviews && reviews.length > 0) {
    context += `\n## ĐÁNH GIÁ CỦA CỘNG ĐỒNG:
${reviews
  .map(
    (r: any) =>
      `- Sách: ${r.book?.title || "Sách"}, Rating: ${r.rating}/5, Nhận xét: "${r.comment}" (Bởi: ${r.user?.fullName || "Khách"})`,
  )
  .join("\n")}
`;
  }

  if (books && books.length > 0) {
    const booksData = books
      .map(
        (book, idx) =>
          `SÁCH #${idx + 1}:
         - Tiêu đề: "${book.title}"
         - Tác giả: ${book.author}
         - Giá: ${book.priceBuy}đ
         - Đánh giá: ${book.rating}/5 sao
         - Đã bán: ${book.soldCount || 0}
         - Mô tả: ${book.description?.slice(0, 150) || "Đang cập nhật..."}`,
      )
      .join("\n\n");
    context += `\n## KHO SÁCH (Dữ liệu thật):\n${booksData}`;
  } else {
    context += `\n## KHO SÁCH: Hiện không có kết quả trực tiếp. Hãy tư vấn linh hoạt.`;
  }

  return context;
};

export {};
