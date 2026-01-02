import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "floating" | "header";
}

export function ThemeToggle({ className, variant = "default" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    setIsAnimating(true);
    const newTheme = theme === "light" ? "dark" : "light";
    
    // Smooth transition
    document.documentElement.style.transition = "background-color 0.3s ease, color 0.3s ease";
    
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    
    setTimeout(() => {
      document.documentElement.style.transition = "";
      setIsAnimating(false);
    }, 300);
  };

  const baseStyles = "relative inline-flex items-center justify-center transition-all duration-300";
  
  const variantStyles = {
    default: "w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card hover:border-border shadow-sm hover:shadow-md",
    floating: "w-12 h-12 rounded-full bg-card shadow-elevated border border-border hover:shadow-glow",
    header: "w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white",
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        baseStyles,
        variantStyles[variant],
        isAnimating && "scale-95",
        className
      )}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <Sun 
          className={cn(
            "absolute inset-0 w-5 h-5 transition-all duration-300",
            theme === "light" 
              ? "rotate-0 scale-100 opacity-100" 
              : "rotate-90 scale-0 opacity-0"
          )}
        />
        {/* Moon Icon */}
        <Moon 
          className={cn(
            "absolute inset-0 w-5 h-5 transition-all duration-300",
            theme === "dark" 
              ? "rotate-0 scale-100 opacity-100" 
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </div>
    </button>
  );
}
