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
    const isDark = document.documentElement.classList.contains("dark");
    document.body.style.backgroundColor = isDark ? "#09090b" : "#F2F3F5";
  }, [isDashboardRoute, pathname]);

  if (isDashboardRoute || pathname === "/access-control" || pathname === "/billing") {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none bg-[#F2F3F5] dark:bg-[#09090b]"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#F2F3F5] dark:bg-[#09090b] transition-colors duration-300"
    >
      <ShaderMetal
        className="w-full h-full opacity-90 dark:opacity-25 transition-opacity duration-300"
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
