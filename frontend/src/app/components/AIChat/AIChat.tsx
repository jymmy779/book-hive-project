"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiMessageCircle, FiX, FiSend, FiBook, FiStar } from "react-icons/fi";
import axios from "axios";

// 1. Gắn thêm mảng relatedBooks vào trong Message
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

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. Bỏ state [relatedBooks, setRelatedBooks] đi

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const storageKey = "bookhive_ai_chat_messages_v1";
  const ttlMs = 24 * 60 * 60 * 1000; // 1 day

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Persist chat for 1 day (all actions, reloads, tab close/open).
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

  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          savedAt: Date.now(),
          messages,
        }),
      );
    } catch {
      // storage may be full or blocked
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chatbot/query`,
        { question: input },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        // Create bot message with response answer, related books, and actions
        const botMessage: Message = {
          type: "bot",
          content: response.data.answer,
          timestamp: new Date(),
          relatedBooks: response.data.related_books || [],
          actions: response.data.ui?.actions || [],
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage: Message = {
          type: "bot",
          content: response.data.message || "Không thể xử lý câu hỏi của bạn",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        type: "bot",
        content:
          error.response?.data?.message ||
          "Có lỗi xảy ra. Vui lòng thử lại sau.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-lg transition-all duration-200 z-40 flex items-center justify-center"
        aria-label="Open AI Chat"
        title="Hỏi AI về sách"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div
          className="fixed bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden transition-all duration-300
                        bottom-20 right-4 w-[300px] h-[450px]
                        sm:bottom-24 sm:right-6 sm:w-80 sm:h-[500px]
                        lg:w-96 lg:h-[600px]"
        >
          {/* Header */}
          <div className="bg-primary text-white p-4 shrink-0">
            <h2 className="font-bold text-lg">AI Hỗ Trợ Book Hive</h2>
            <p className="text-xs text-blue-100">
              Hỏi về sách, danh mục, hoặc chính sách
            </p>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FiMessageCircle
                    size={40}
                    className="mx-auto text-gray-300 mb-2"
                  />
                  <p className="text-gray-500 text-sm">
                    <FiMessageCircle className="inline mr-1" /> Xin chào! Bạn có câu hỏi gì về sách?
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}
                  >
                    {/* Bubble Text */}
                    <div
                      className={`max-w-[85%] px-4 py-2 rounded-lg shadow-sm ${
                        msg.type === "user"
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm break-words leading-relaxed">
                        {msg.content}
                      </p>
                      <p
                        className={`text-[10px] mt-1 text-right ${msg.type === "user" ? "text-blue-100" : "text-gray-400"}`}
                      >
                        {msg.timestamp.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Related Books Suggestions */}
                    {msg.relatedBooks && msg.relatedBooks.length > 0 && (
                      <div className="mt-2 w-[85%] space-y-2 pl-2">
                        <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <FiBook /> Gợi ý cho bạn:
                        </p>
                        {msg.relatedBooks.map((book) => (
                          <a
                            key={book.id}
                            href={`/books/detail/${book.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                          >
                            <p className="text-sm font-semibold text-blue-600 truncate">
                              {book.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {book.author}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-bold text-red-500">
                                {book.price.toLocaleString("vi-VN")}đ
                              </span>
                              <span className="text-xs text-yellow-500 flex items-center gap-1">
                                <FiStar className="fill-current" /> {book.rating}
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 w-[85%] flex flex-col gap-2 pl-2">
                        {msg.actions.map((action, actionIdx) =>
                          action.type === "link" ? (
                            <a
                              key={actionIdx}
                              href={action.href || "#"}
                              target={
                                action.href?.startsWith("http")
                                  ? "_blank"
                                  : undefined
                              }
                              rel={
                                action.href?.startsWith("http")
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className="px-3 py-2 bg-primary hover:bg-primary-dark text-white text-xs rounded-lg font-semibold transition-all shadow-sm text-center"
                            >
                              {action.label}
                            </a>
                          ) : (
                            <button
                              key={actionIdx}
                              onClick={async () => {
                                if (action.apiPath) {
                                  try {
                                    const method = (
                                      action.method || "GET"
                                    ).toUpperCase();
                                    const response = await axios({
                                      method: method as any,
                                      url: `${process.env.NEXT_PUBLIC_API_URL}${action.apiPath}`,
                                    });
                                    console.log(
                                      "API Action Response:",
                                      response.data,
                                    );
                                  } catch (error) {
                                    console.error("API Action Error:", error);
                                  }
                                }
                              }}
                              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-semibold transition-all shadow-sm"
                            >
                              {action.label}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading State */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg rounded-bl-none shadow-sm">
                      <div className="flex gap-1 items-center h-4">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
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
            className="border-t border-gray-200 p-3 bg-white shrink-0"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ví dụ: Tìm sách..."
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm disabled:bg-gray-100 min-w-0"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white h-10 w-10 flex items-center justify-center rounded-full transition-all shadow-sm shrink-0"
              >
                <FiSend size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
