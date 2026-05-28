"use client";

import { useState } from "react";
import InstantShell from "./components/InstantShell";

export default function WorkoutPage() {
  const [started, setStarted] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Layer 1: Instant Shell — the ONLY thing on first paint */}
      {!started && <InstantShell onStart={() => setStarted(true)} />}

      {/* Layer 2: Runtime Island — only mounts after user clicks Start */}
      {started && <RuntimeIsland />}
    </div>
  );
}

function RuntimeIsland() {
  const [{ Component }, setComponent] = useState<{ Component: React.ComponentType | null }>({ Component: null });

  if (!Component) {
    import("./WorkoutController").then((mod) => {
      setComponent({ Component: mod.default });
    });
    return null;
  }

  const C = Component;
  return <C />;
}
