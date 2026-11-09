"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function StartupScreen() {
  const [phase, setPhase] = useState<"hidden" | "waiting" | "leaving">("hidden");
  const backendWasUnavailable = useRef(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout>;
    let leaveTimer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();

    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_URL}/health`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.ok) {
          if (active) {
            if (backendWasUnavailable.current) {
              setPhase("leaving");
              leaveTimer = setTimeout(() => {
                if (active) setPhase("hidden");
              }, 480);
            }
            // The first server render may have completed while the backend was
            // unavailable and returned empty data. Render the current route again.
            if (backendWasUnavailable.current) router.refresh();
          }
          return;
        }
      } catch {
        // The API may still be waking up; keep the screen visible and retry.
      }

      if (active) {
        backendWasUnavailable.current = true;
        setPhase("waiting");
        retryTimer = setTimeout(checkBackend, 1800);
      }
    };

    void checkBackend();

    return () => {
      active = false;
      controller.abort();
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
        <p className="startup-screen__message">Server đang khởi động...</p>
        <div className="startup-screen__track" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
