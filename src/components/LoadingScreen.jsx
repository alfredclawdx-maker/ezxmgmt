import { useState, useEffect } from "react";
import { SpecialText } from "./SpecialText.jsx";

export function LoadingScreen({ onComplete }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2100);
    const doneTimer = setTimeout(onComplete, 2500);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 ${fading ? "ezx-fade-out" : ""}`}>
      <SpecialText className="text-4xl sm:text-5xl font-bold text-blue-400 mb-12 tracking-widest" speed={20}>
        EZXMGMT
      </SpecialText>

      {/* 7 animated loading dashes */}
      <div className="flex gap-2 mb-6">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="w-10 h-1 bg-blue-400 rounded"
            style={{
              animation: "ezxPulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <p className="text-gray-400 text-sm font-mono">Loading...</p>
    </div>
  );
}
