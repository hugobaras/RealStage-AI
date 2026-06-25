import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

export default function SearchableSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  theme,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const selected = options.find((o) => o.id === value) ?? options[0];

  const filtered = query.trim()
    ? options.filter(
        (o) =>
          o.displayLabel?.toLowerCase().includes(query.toLowerCase()) ||
          o.label?.toLowerCase().includes(query.toLowerCase()) ||
          o.description?.toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="section-label mb-2 block">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="input-field flex items-center justify-between text-left disabled:opacity-40"
      >
        <span className="truncate">
          {selected?.displayLabel ?? selected?.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-zinc-700/80 bg-panel shadow-2xl shadow-black/40">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              autoFocus
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted">Aucun résultat</li>
            )}
            {filtered.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={`flex w-full flex-col px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-800 ${
                    option.id === value
                      ? `${theme?.selectActive ?? "bg-accent/15 text-accent-light"}`
                      : "text-white"
                  }`}
                >
                  <span>{option.displayLabel ?? option.label}</span>
                  {option.description && (
                    <span className="text-[11px] text-muted">
                      {option.description}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
