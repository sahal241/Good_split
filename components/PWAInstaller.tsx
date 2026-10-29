"use client";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Service Worker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("Service Worker registration failed:", err);
          });
      });
    }

    // 2. Detect Standalone / Already installed
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // 4. Listen for Chrome/Android beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 5. Listen for appinstalled event
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      console.log("GoodSplit was successfully installed");
    });

    // On iOS Safari, show prompt banner if not dismissed recently
    if (isIOSDevice && !isStandaloneMode) {
      const dismissed = sessionStorage.getItem("goodsplit_pwa_dismissed");
      if (!dismissed) {
        setShowBanner(true);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  }

  function handleDismiss() {
    setShowBanner(false);
    sessionStorage.setItem("goodsplit_pwa_dismissed", "true");
  }

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Floating PWA Install Bar */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-sm bg-[#FFFFFF] border border-[#2D7D6F]/30 shadow-xl rounded-2xl p-3.5 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#2D7D6F] flex items-center justify-center text-white font-extrabold text-sm shadow-xs shrink-0 select-none">
            GS
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#1A1A1A] truncate">
              Install GoodSplit
            </p>
            <p className="text-[11px] text-[#6B7280] truncate">
              Fast offline access &amp; home screen app
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-[#2D7D6F] hover:bg-[#1F5C52] text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
          >
            {isIOS ? "How to Add" : "Install"}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1 text-[#6B7280] hover:text-[#1A1A1A] rounded-lg transition-colors text-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* iOS Safari Home Screen Instructions Modal */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIOSGuide(false);
          }}
        >
          <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E2D6C8] w-full max-w-sm p-6 animate-in fade-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E2D6C8]">
              <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                <span>📲</span>
                <span>Add to Home Screen</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="text-[#6B7280] hover:text-[#1A1A1A] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#6B7280] mb-4">
              To install GoodSplit on your iPhone or iPad, follow these 2 quick steps in Safari:
            </p>

            <ol className="space-y-3 text-xs text-[#1A1A1A] font-medium mb-5">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E6F3F1] text-[#2D7D6F] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Tap the <strong className="text-[#2D7D6F]">Share button</strong> at the bottom of Safari (
                  <span className="inline-block px-1 bg-[#FAF5ED] border border-[#E2D6C8] rounded text-[10px]">
                    ⎋ or ⬆
                  </span>
                  ).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E6F3F1] text-[#2D7D6F] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Scroll down and tap <strong className="text-[#2D7D6F]">&ldquo;Add to Home Screen&rdquo;</strong> (
                  <span className="inline-block px-1 bg-[#FAF5ED] border border-[#E2D6C8] rounded text-[10px]">
                    ➕
                  </span>
                  ).
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-[#2D7D6F] text-white text-xs font-bold rounded-xl hover:bg-[#1F5C52] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
