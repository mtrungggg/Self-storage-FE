import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * PageTransition — wraps page content with a smooth slide + fade transition.
 * Uses CSS animations only (no external libs). Each route change triggers
 * a quick slide-up + fade-in on the incoming page.
 */
function PageTransition({ children }) {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reset to initial state
    el.style.opacity = "0";
    el.style.transform = "translateY(14px)";

    // Trigger the animation on next frame
    let endTimer = null;
    const frame = requestAnimationFrame(() => {
      el.style.transition = "opacity 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1)";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";

      // Clear transform after transition so child fixed elements aren't trapped in transform containing block
      endTimer = setTimeout(() => {
        if (el) {
          el.style.transform = "none";
          el.style.willChange = "auto";
        }
      }, 300);
    });

    return () => {
      cancelAnimationFrame(frame);
      if (endTimer) clearTimeout(endTimer);
      if (el) {
        el.style.transition = "";
        el.style.opacity = "";
        el.style.transform = "";
      }
    };
  }, [location.pathname]);

  return (
    <div ref={ref} style={{ willChange: "opacity, transform" }}>
      {children}
    </div>
  );
}

export default PageTransition;
