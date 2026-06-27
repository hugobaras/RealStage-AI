import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";

function matchesQuery(option, query) {
  const q = query.toLowerCase();
  return (
    option.displayLabel?.toLowerCase().includes(q) ||
    option.label?.toLowerCase().includes(q) ||
    option.description?.toLowerCase().includes(q) ||
    option.category?.toLowerCase().includes(q)
  );
}

function groupByCategory(options, categoryOrder) {
  const map = new Map();
  for (const option of options) {
    const category = option.category ?? "Autres";
    if (!map.has(category)) map.set(category, []);
    map.get(category).push(option);
  }

  const order = categoryOrder?.length
    ? categoryOrder
    : [...map.keys()].sort((a, b) => a.localeCompare(b, "fr"));

  return order
    .filter((cat) => map.has(cat))
    .map((cat) => ({ category: cat, items: map.get(cat) }));
}

export default function SearchableSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  theme,
  categoryOrder,
  resolveOption,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const selected =
    options.find((o) => o.id === value) ?? resolveOption?.(value) ?? options[0];

  const filtered = query.trim()
    ? options.filter((o) => matchesQuery(o, query))
    : options;

  const groups = useMemo(
    () => groupByCategory(filtered, categoryOrder),
    [filtered, categoryOrder],
  );

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

  const renderOption = (option) => (
    <li key={option.id}>
      <button
        type="button"
        onClick={() => handleSelect(option.id)}
        className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-800 ${
          option.id === value
            ? `${theme?.selectActive ?? "bg-accent/15 text-accent-light"}`
            : "text-white"
        }`}
      >
        {option.previewImage && (
          <img
            src={option.previewImage}
            alt=""
            className="h-8 w-10 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
          />
        )}
        <span className="min-w-0 flex-1">
          <span className="block">{option.displayLabel ?? option.label}</span>
          {option.description && (
            <span className="block text-[11px] text-muted">
              {option.description}
            </span>
          )}
        </span>
      </button>
    </li>
  );

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="section-label mb-2 block">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="input-field flex items-center justify-between gap-2 text-left disabled:opacity-40"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {selected?.previewImage && (
            <img
              src={selected.previewImage}
              alt=""
              className="h-8 w-10 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
            />
          )}
          <span className="truncate">
            {selected?.displayLabel ?? selected?.label}
          </span>
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
          <ul className="max-h-60 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted">Aucun résultat</li>
            )}
            {query.trim()
              ? filtered.map((option) => renderOption(option))
              : groups.map(({ category, items }) => (
                  <li key={category}>
                    <div className="sticky top-0 z-10 border-b border-zinc-800/80 bg-panel/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      {category}
                    </div>
                    <ul>{items.map((option) => renderOption(option))}</ul>
                  </li>
                ))}
          </ul>
        </div>
      )}
    </div>
  );
}
