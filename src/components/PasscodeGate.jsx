import { useState, useEffect, useRef } from "react";

const CORRECT_PASSCODE = "0001001";

export function PasscodeGate({ onAuthenticated }) {
  const [passcode, setPasscode] = useState(["", "", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const validate = (entered) => {
    if (entered === CORRECT_PASSCODE) {
      onAuthenticated(entered);
    } else {
      setError("Incorrect passcode");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPasscode(["", "", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  };

  const handleInput = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1); // numeric only, last char
    if (value !== "" && digit === "") return;

    const next = [...passcode];
    next[index] = digit;
    setPasscode(next);
    setError("");

    if (digit && index < 6) {
      inputRefs.current[index + 1]?.focus();
    }
    if (index === 6 && digit) {
      validate(next.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (passcode[index]) {
        const next = [...passcode];
        next[index] = "";
        setPasscode(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...passcode];
        next[index - 1] = "";
        setPasscode(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 6) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center ezx-fade-in"
      onClick={() => {
        const firstEmpty = passcode.findIndex((d) => !d);
        inputRefs.current[firstEmpty === -1 ? 6 : firstEmpty]?.focus();
      }}
    >
      {/* 7 floating dash slots — digits appear as masked dots above each bar */}
      <div className={`flex gap-4 sm:gap-6 ${shake ? "ezx-shake" : ""}`}>
        {passcode.map((digit, index) => (
          <div key={index} className="flex flex-col items-center w-9 sm:w-14">
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={1}
              value={digit}
              aria-label={`Passcode digit ${index + 1}`}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => e.preventDefault()}
              className="w-full h-9 bg-transparent border-none text-center text-2xl font-bold text-white caret-transparent focus:outline-none selection:bg-transparent"
            />
            <div
              className={`h-[3px] w-full rounded-full transition-all duration-200
                ${error ? "bg-red-500" : "bg-white"}`}
              style={!error && !digit ? { animation: "ezxPulse 1.8s ease-in-out infinite", animationDelay: `${index * 0.1}s` } : { opacity: 1 }}
            />
          </div>
        ))}
      </div>

      {error && <p className="mt-8 text-red-500 text-sm font-medium animate-pulse">{error}</p>}
    </div>
  );
}
