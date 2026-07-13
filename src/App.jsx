import { useState, useCallback } from "react";
import { LoadingScreen } from "./components/LoadingScreen.jsx";
import { PasscodeGate } from "./components/PasscodeGate.jsx";
import { PipelineKanban } from "./components/PipelineKanban.jsx";

/**
 * Flow: loading → passcode → pipeline
 * Logout → passcode (LoadingScreen never replays).
 * Auth is intentionally NOT persisted — passcode required on every load.
 */
export default function App() {
  const [appState, setAppState] = useState("dashboard");

  const handleLoadingComplete = useCallback(() => setAppState("passcode"), []);
  const handleAuthenticated = useCallback(() => setAppState("pipeline"), []);
  const handleLogout = useCallback(() => setAppState("passcode"), []);

  return (
    <div className="w-full min-h-screen bg-slate-950">
      {appState === "loading" && <LoadingScreen onComplete={handleLoadingComplete} />}
      {appState === "passcode" && <PasscodeGate onAuthenticated={handleAuthenticated} />}
      {appState === "pipeline" && <PipelineKanban onLogout={handleLogout} />}
    </div>
  );
}
