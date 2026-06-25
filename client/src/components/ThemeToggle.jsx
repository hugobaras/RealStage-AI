import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle({
  compact = false,
  iconOnly = false,
  className = "",
}) {
  const { isLight, toggleTheme } = useTheme();
  const label = isLight ? "Mode sombre" : "Mode clair";

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`theme-toggle flex h-10 w-10 items-center justify-center rounded-xl ${className}`}
        title={label}
        aria-label={label}
      >
        {isLight ? (
          <Moon className="h-4 w-4" strokeWidth={1.5} />
        ) : (
          <Sun className="h-4 w-4" strokeWidth={1.5} />
        )}
      </button>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`theme-toggle-compact flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 ${className}`}
        title={label}
        aria-label={label}
      >
        {isLight ? (
          <Moon className="h-5 w-5" strokeWidth={1.5} />
        ) : (
          <Sun className="h-5 w-5" strokeWidth={1.5} />
        )}
        <span className="max-w-full truncate text-center text-[10px] font-semibold leading-tight">
          {isLight ? "Sombre" : "Clair"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${className}`}
      aria-label={label}
    >
      {isLight ? (
        <Moon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      ) : (
        <Sun className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      )}
      <span>{label}</span>
    </button>
  );
}
