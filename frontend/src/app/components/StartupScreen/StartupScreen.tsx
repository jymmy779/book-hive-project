"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function StartupScreen() {
  const [phase, setPhase] = useState<"hidden" | "waiting" | "leaving">(
    "waiting",
  );
  const backendWasUnavailable = useRef(false);
  const overlayWasShown = useRef(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout>;
    let leaveTimer: ReturnType<typeof setTimeout>;
    let requestController: AbortController | undefined;
    let consecutiveFailures = 0;
    const retryDelay = 1800;
    const maxRetries = 3;
    const isCatalogRoute = window.location.pathname === "/books";

    const checkBackend = async () => {
      requestController = new AbortController();
      const { signal } = requestController;
      const timeout = setTimeout(() => requestController?.abort(), 12000);
      try {
        const healthResponse = await fetch(`${API_URL}/health`, {
          cache: "no-store",
          signal,
        });
        if (!healthResponse.ok) throw new Error("API health check failed");

        if (isCatalogRoute) {
          const params = new URLSearchParams(window.location.search);
          params.set("page", params.get("page") || "1");
          params.set("limit", "12");
          const [categoriesResponse, booksResponse] = await Promise.all([
            fetch(`${API_URL}/api/v1/books/categories`, {
              cache: "no-store",
              signal,
            }),
            fetch(`${API_URL}/api/v1/books?${params.toString()}`, {
              cache: "no-store",
              signal,
            }),
          ]);
          if (!categoriesResponse.ok || !booksResponse.ok) {
            throw new Error("Catalog data is not ready");
          }
          await Promise.all([categoriesResponse.json(), booksResponse.json()]);
        }

        if (active) {
          consecutiveFailures = 0;
          if (overlayWasShown.current) {
            setPhase("leaving");
            leaveTimer = setTimeout(() => {
              if (active) {
                setPhase("hidden");
                overlayWasShown.current = false;
              }
            }, 480);
          }
          if (backendWasUnavailable.current) {
            // Re-render server-fetched pages after the backend wakes up.
            router.refresh();
            backendWasUnavailable.current = false;
          }
        }
      } catch {
        if (active) {
          overlayWasShown.current = true;
          setPhase("waiting");
          consecutiveFailures += 1;
          // Keep a brief wait and retry when the backend is waking up. After a
          // few failed attempts, reveal the page so a persistent API error does
          // not leave the user behind an endless overlay.
          if (consecutiveFailures >= maxRetries) {
            setPhase("leaving");
            leaveTimer = setTimeout(() => {
              if (active) {
                setPhase("hidden");
                overlayWasShown.current = false;
              }
            }, 480);
            return;
          }
          backendWasUnavailable.current = true;
          retryTimer = setTimeout(checkBackend, retryDelay);
        }
      } finally {
        clearTimeout(timeout);
      }
    };

    void checkBackend();

    return () => {
      active = false;
      requestController?.abort();
      clearTimeout(retryTimer);
      clearTimeout(leaveTimer);
    };
  }, [router]);

  if (phase === "hidden") return null;

  return (
    <div
      className={`startup-screen startup-screen--${phase}`}
      role="status"
      aria-live="polite"
      aria-label="Đang chờ máy chủ khởi động"
    >
      <div className="startup-screen__content">
        <p className="startup-screen__eyebrow">BOOK HIVE</p>
        <h1>Chờ chút nhé</h1>
        <p className="startup-screen__message">
          Server (Render) đang khởi động...
        </p>
        <div className="startup-screen__track" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
