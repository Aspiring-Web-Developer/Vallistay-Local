import { useEffect, useRef, useState } from "react";
import useNetworkStatus from "../hooks/useNetworkStatus";

export default function NetworkStatus() {
  const { isOnline, checking, retry } = useNetworkStatus();
  const [shouldRender, setShouldRender] = useState(!isOnline);
  const [closing, setClosing] = useState(false);
  const [shake, setShake] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!isOnline) {
      clearTimeout(timeoutRef.current);
      setClosing(false);
      setShouldRender(true);
    } else if (shouldRender) {
      setClosing(true);
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
        setClosing(false);
      }, 420);
    }
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const handleRetry = async () => {
    const ok = await retry();
    if (!ok) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (!shouldRender) return null;

  return (
    <div className={`ns-overlay ${closing ? "ns-out" : "ns-in"}`}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@400;600;700;800&display=swap" />
      <style>{`
        .ns-overlay {
          position: fixed; inset: 0; z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          background: rgba(31, 23, 64, 0.32);
          backdrop-filter: blur(6px);
          font-family: 'Lato', -apple-system, sans-serif;
        }
        .ns-in { animation: ns-fade-in 0.32s cubic-bezier(0.16,1,0.3,1) forwards; }
        .ns-out { animation: ns-fade-out 0.4s cubic-bezier(0.4,0,1,1) forwards; }
        @keyframes ns-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ns-fade-out { to { opacity: 0; } }

        .ns-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 40px 36px 32px;
          width: 320px;
          text-align: center;
          box-shadow: 0 24px 60px rgba(31,23,64,0.22);
          transform: scale(0.94);
          animation: ns-pop 0.36s cubic-bezier(0.16,1,0.3,1) 0.05s forwards;
        }
        .ns-out .ns-card { animation: ns-pop-out 0.4s cubic-bezier(0.4,0,1,1) forwards; }
        @keyframes ns-pop { to { transform: scale(1); } }
        @keyframes ns-pop-out { to { transform: scale(0.96) translateY(6px); } }

        .ns-shake { animation: ns-shake 0.4s ease; }
        @keyframes ns-shake {
          10%,90% { transform: translateX(-2px); }
          20%,80% { transform: translateX(4px); }
          30%,50%,70% { transform: translateX(-7px); }
          40%,60% { transform: translateX(7px); }
        }

        .ns-signal {
          position: relative;
          width: 76px; height: 76px;
          margin: 0 auto 22px;
          display: flex; align-items: center; justify-content: center;
        }
        .ns-ring {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 1.5px solid #EF4444;
          opacity: 0;
          animation: ns-ring-pulse 2.2s ease-out infinite;
        }
        .ns-ring-2 { animation-delay: 0.7s; }
        @keyframes ns-ring-pulse {
          0% { transform: scale(0.55); opacity: 0.55; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        .ns-icon {
          position: relative; z-index: 1;
          width: 34px; height: 34px;
          color: #EF4444;
        }

        .ns-title { font-size: 18px; font-weight: 800; color: #1F1740; margin-bottom: 8px; }
        .ns-subtitle { font-size: 13px; color: #6B7280; line-height: 1.55; margin-bottom: 24px; }

        .ns-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%;
          background: #2563EB; color: #fff;
          border: none; border-radius: 9px;
          padding: 11px 0;
          font-family: inherit; font-size: 13.5px; font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(37,99,235,0.28);
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .ns-btn:hover:not(:disabled) { background: #1D4ED8; }
        .ns-btn:active:not(:disabled) { transform: scale(0.98); }
        .ns-btn:disabled { opacity: 0.75; cursor: not-allowed; }

        .ns-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: ns-spin 0.7s linear infinite;
        }
        @keyframes ns-spin { to { transform: rotate(360deg); } }

        @media (prefers-reduced-motion: reduce) {
          .ns-ring, .ns-spinner, .ns-shake { animation: none !important; }
          .ns-in, .ns-out, .ns-card { animation-duration: 0.01s !important; }
        }
      `}</style>

      <div className={`ns-card ${shake ? "ns-shake" : ""}`}>
        <div className="ns-signal">
          <span className="ns-ring ns-ring-1" />
          <span className="ns-ring ns-ring-2" />
          <svg className="ns-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9z" />
            <path d="M5 13l2 2a8.5 8.5 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            <path d="M9 17l2 2c.55-.55 1.45-.55 2 0l2-2a4 4 0 00-6 0z" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        </div>

        <div className="ns-title">Connection lost</div>
        <div className="ns-subtitle">Can't reach the server right now. Check your network, then reconnect.</div>

        <button className="ns-btn" onClick={handleRetry} disabled={checking}>
          {checking ? (<><span className="ns-spinner" /> Checking…</>) : "Reconnect"}
        </button>
      </div>
    </div>
  );
}