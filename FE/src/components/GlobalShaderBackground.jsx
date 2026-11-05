import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ShaderMetal from "./ui/shader-metal";

export default function GlobalShaderBackground() {
  const { pathname } = useLocation();

  // Background shader ONLY renders on customer pages and auth (login / register)
  // Dashboard background in Staff, Manager, Admin is pure solid white (pure dark in dark mode)
  const isDashboardRoute =
    pathname.startsWith("/staff") ||
    pathname.startsWith("/manager") ||
    pathname.startsWith("/admin");

  // Keep body background transparent for customer/login pages so shader shines through crisply
  useEffect(() => {
    if (isDashboardRoute) {
      document.body.style.backgroundColor = document.documentElement.classList.contains("dark")
        ? "#09090b"
        : "#ffffff";
    } else {
      document.body.style.backgroundColor = "transparent";
    }
  }, [isDashboardRoute, pathname]);

  if (isDashboardRoute) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none bg-white dark:bg-zinc-950"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-transparent"
    >
      <ShaderMetal
        className="w-full h-full opacity-100 dark:opacity-75"
        settings={{
          metal: "chrome",
          color: "#E4E4E7",
          ribbons: 3,
          speed: 0.35,
          iridescence: 0.3,
          interactive: true,
        }}
      />
    </div>
  );
}
