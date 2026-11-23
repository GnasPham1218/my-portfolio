import { lazy, Suspense, useState } from "react";
import Portfolio from "./Portfolio";
import Boundary from "./space/Boundary";
import { canUseWebGL } from "./space/support";

// The 3D view (Three.js + React Three Fiber) is its own chunk, so the 2D page never downloads it
const SpacePortfolio = lazy(() => import("./space/SpacePortfolio"));
const WEBGL = canUseWebGL();

type View = "space" | "classic";

function initialView(): View {
  try {
    if (localStorage.getItem("view") === "classic") return "classic";
  } catch {
    /* localStorage unavailable */
  }
  return WEBGL ? "space" : "classic";
}

export default function App() {
  const [view, setView] = useState<View>(initialView);

  const switchTo = (next: View) => {
    try {
      localStorage.setItem("view", next);
    } catch {
      /* ignore */
    }
    window.scrollTo(0, 0);
    setView(next);
  };

  const classic = <Portfolio onSpace={WEBGL ? () => switchTo("space") : undefined} />;
  if (view === "classic" || !WEBGL) return classic;

  return (
    <Boundary fallback={classic}>
      <Suspense fallback={<div className="space-boot">Launching…</div>}>
        <SpacePortfolio onClassic={() => switchTo("classic")} />
      </Suspense>
    </Boundary>
  );
}
