"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FiMessageCircle,
  FiX,
  FiSend,
  FiBook,
  FiStar,
  FiTrash2,
  FiZap,
  FiMinimize2,
} from "react-icons/fi";
import axios from "axios";

interface RelatedBook {
  id: string;
  title: string;
  author: string;
  price: number;
  rating: number;
  image: string;
  slug: string;
}

interface UiAction {
  type: "link" | "api";
  label: string;
  href?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  apiPath?: string;
}

interface Message {
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  relatedBooks?: RelatedBook[];
  actions?: UiAction[];
}

const QUICK_PROMPTS = [
  "Gợi ý sách hay cho tôi",
  "Sách bán chạy nhất",
  "Tìm sách theo thể loại",
];

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const storageKey = "bookhive_ai_chat_messages_v1";
  const ttlMs = 24 * 60 * 60 * 1000;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Restore chat from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as any;
      const savedAt = Number(parsed?.savedAt);
      const storedMessages = parsed?.messages;
      if (!savedAt || !Array.isArray(storedMessages)) return;
      if (Date.now() - savedAt > ttlMs) {
        localStorage.removeItem(storageKey);
        return;
      }
      const restored: Message[] = storedMessages
        .map((m) => ({
          type: m.type,
          content: m.content,
          timestamp: new Date(m.timestamp),
          relatedBooks: m.relatedBooks || [],
          actions: m.actions || [],
        }))
        .filter((m) => (m.type === "user" || m.type === "bot") && !!m.content);
      if (restored.length > 0) setMessages(restored);
    } catch {
      // ignore corrupted storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for open-ai-chat event from external triggers
  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      setIsMinimized(false);
      if (customEvent.detail?.prompt) {
        setInput(customEvent.detail.prompt);
      }
    };
    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat);
  }, []);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ savedAt: Date.now(), messages }),
      );
    } catch {
      // storage may be full or blocked
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSubmit = async (e: React.FormEvent, promptOverride?: string) => {
    e.preventDefault();
    const question = promptOverride ?? input;
    if (!question.trim() || loading) return;

    const userMessage: Message = {
      type: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chatbot/query`,
        {
          question,
          history: messages.slice(-10).map((message) => ({
            role: message.type === "user" ? "user" : "assistant",
            content: message.content,
            bookIds: message.relatedBooks?.map((book) => book.id) || [],
          })),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        const botMessage: Message = {
          type: "bot",
          content: response.data.answer,
          timestamp: new Date(),
          relatedBooks: response.data.related_books || [],
          actions: response.data.ui?.actions || [],
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: response.data.message || "Không thể xử lý câu hỏi của bạn",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            setIsOpen(true);
            setIsMinimized(false);
          }
        }}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 bg-primary hover:bg-primary-dark text-white rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 z-40 flex items-center gap-2.5 group"
        aria-label="Open AI Chat"
        title="Hỏi AI về sách"
      >
        <div className="relative">
          {isOpen ? <FiX size={20} /> : <FiMessageCircle size={20} />}
          {!isOpen && messages.length === 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
          )}
        </div>
        <span className="text-sm font-semibold hidden sm:inline">AI Tư Vấn</span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-surface border border-border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 rounded-2xl
            bottom-20 right-4 w-[calc(100vw-2rem)] max-w-[360px] sm:right-6
            ${isMinimized ? "h-14" : "h-[520px] sm:h-[580px] lg:h-[600px]"}`}
        >
          {/* Header */}
          <div className="bg-primary px-4 py-3 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center">
                <FiZap size={15} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-sm leading-tight">AI BookHive</h2>
                <p className="text-primary-light/70 text-[10px]">Trợ lý sách thông minh</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Xóa cuộc trò chuyện"
                >
                  <FiTrash2 size={14} />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
              >
                <FiMinimize2 size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Đóng"
              >
                <FiX size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-cream">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mb-4">
                      <FiZap size={28} className="text-primary" />
                    </div>
                    <h3 className="font-bold text-primary text-base mb-1">Xin chào! 👋</h3>
                    <p className="text-text-muted text-xs text-center mb-5 px-4 leading-relaxed">
                      Tôi là AI BookHive, sẵn sàng giúp bạn tìm sách phù hợp nhất!
                    </p>
                    <div className="w-full space-y-2 px-2">
                      {QUICK_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={(e) => handleSubmit(e as any, prompt)}
                          className="w-full text-left px-3 py-2 bg-surface border border-border rounded-xl text-xs text-text-secondary hover:bg-primary-light hover:text-primary hover:border-primary/30 transition-all font-medium"
                        >
                          💬 {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}
                      >
                        {/* Bubble */}
                        <div
                          className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            msg.type === "user"
                              ? "bg-primary text-white rounded-br-sm"
                              : "bg-surface border border-border text-text-primary rounded-bl-sm shadow-sm"
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <p
                            className={`text-[10px] mt-1 text-right ${
                              msg.type === "user" ? "text-white/50" : "text-text-muted"
                            }`}
                          >
                            {msg.timestamp.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Related Books */}
                        {msg.relatedBooks && msg.relatedBooks.length > 0 && (
                          <div className="mt-2 w-[88%] space-y-1.5">
                            <p className="text-[10px] font-semibold text-text-muted flex items-center gap-1 pl-1">
                              <FiBook size={10} /> Gợi ý cho bạn:
                            </p>
                            {msg.relatedBooks.map((book) => (
                              <a
                                key={book.id}
                                href={`/books/detail/${book.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-2.5 bg-surface border border-border rounded-xl hover:border-primary/30 hover:bg-primary-light/40 transition-all shadow-xs"
                              >
                                <p className="text-xs font-semibold text-primary truncate">{book.title}</p>
                                <p className="text-[10px] text-text-muted mt-0.5">{book.author}</p>
                                <div className="flex items-center justify-between mt-1.5">
                                  <span className="text-[11px] font-bold text-accent">
                                    {book.price.toLocaleString("vi-VN")}đ
                                  </span>
                                  <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                                    <FiStar size={10} className="fill-current" />
                                    {book.rating}
                                  </span>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="mt-2 w-[88%] flex flex-col gap-1.5">
                            {msg.actions.map((action, actionIdx) =>
                              action.type === "link" ? (
                                <a
                                  key={actionIdx}
                                  href={action.href || "#"}
                                  target={action.href?.startsWith("http") ? "_blank" : undefined}
                                  rel={action.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                                  className="px-3 py-2 bg-primary hover:bg-primary-dark text-white text-xs rounded-xl font-semibold transition-all text-center"
                                >
                                  {action.label}
                                </a>
                              ) : (
                                <button
                                  key={actionIdx}
                                  onClick={async () => {
                                    if (action.apiPath) {
                                      try {
                                        await axios({
                                          method: (action.method || "GET").toUpperCase() as any,
                                          url: `${process.env.NEXT_PUBLIC_API_URL}${action.apiPath}`,
                                        });
                                      } catch {}
                                    }
                                  }}
                                  className="px-3 py-2 bg-success hover:bg-emerald-600 text-white text-xs rounded-xl font-semibold transition-all"
                                >
                                  {action.label}
                                </button>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Loading indicator */}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-surface border border-border px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                          <div className="flex gap-1 items-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSubmit}
                className="border-t border-border p-3 bg-surface shrink-0"
              >
                <div className="flex gap-2 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi về sách, thể loại..."
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:bg-surface transition-all text-sm disabled:opacity-60 min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-primary hover:bg-primary-dark disabled:bg-border disabled:text-text-muted text-white h-9 w-9 flex items-center justify-center rounded-xl transition-all shadow-sm shrink-0"
                  >
                    <FiSend size={15} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
