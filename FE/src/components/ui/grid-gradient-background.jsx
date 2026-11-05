import { cn } from "@/lib/utils";
import GlobalShaderBackground from "@/components/GlobalShaderBackground";

export function GridGradientBackground({ className, children, ...props }) {
  return (
    <div className={cn("relative min-h-screen w-full text-zinc-900 dark:text-zinc-100", className)} {...props}>
      <GlobalShaderBackground />
      {children}
    </div>
  );
}

export default GridGradientBackground;
