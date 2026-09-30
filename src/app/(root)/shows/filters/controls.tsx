"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FilterOption } from "../filterConfig";

export const inputClass =
  "h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-primaryColor/60 focus:ring-2 focus:ring-primaryColor/20 disabled:cursor-not-allowed disabled:opacity-50";

export function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primaryColor/50",
        active
          ? "border-primaryColor/70 bg-primaryColor/15 text-primaryColor shadow-[0_0_0_1px_rgba(252,211,77,0.15)]"
          : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:bg-white/[0.08] hover:text-white",
        className
      )}
    >
      {active ? <Check className="size-3" /> : null}
      {children}
    </button>
  );
}

/** Multi-select chips with an optional collapse for long option lists. */
export function ChipGroup({
  options,
  selected,
  onToggle,
  initialLimit,
  emptyLabel = "No options available",
}: {
  options: FilterOption[];
  selected: Array<string | number>;
  onToggle: (option: FilterOption) => void;
  initialLimit?: number;
  emptyLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (options.length === 0) {
    return <p className="text-xs text-white/35">{emptyLabel}</p>;
  }

  const limited =
    initialLimit && !expanded ? options.slice(0, initialLimit) : options;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {limited.map((option) => (
          <FilterChip
            key={option.id}
            active={selected.some((value) => `${value}` === `${option.id}`)}
            onClick={() => onToggle(option)}
          >
            {option.name}
          </FilterChip>
        ))}
      </div>
      {initialLimit && options.length > initialLimit ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-fit text-xs font-medium text-primaryColor/80 transition-colors hover:text-primaryColor"
        >
          {expanded ? "Show less" : `Show all ${options.length}`}
        </button>
      ) : null}
    </div>
  );
}

/** Free-text number input that commits on blur or Enter (never mid-keystroke). */
export function NumberField({
  label,
  value,
  onCommit,
  placeholder,
  min = 0,
  max = 100,
  step = 1,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  const [draft, setDraft] = useState(value);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(value);
  }, [value]);

  const commit = () => {
    if (draft !== value) onCommit(draft.trim());
  };

  return (
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={draft}
        placeholder={placeholder}
        onFocus={() => (focused.current = true)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          focused.current = false;
          commit();
        }}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className={inputClass}
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "All",
  includeEmpty = true,
}: {
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  includeEmpty?: boolean;
}) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? (
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
          {label}
        </span>
      ) : null}
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, "cursor-pointer appearance-none pr-9")}
        >
          {includeEmpty ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-white/40" />
      </div>
    </label>
  );
}

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
        checked
          ? "border-primaryColor/40 bg-primaryColor/[0.08]"
          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span className="min-w-0">
        <span
          className={cn(
            "block text-sm font-medium",
            checked ? "text-primaryColor" : "text-white/80"
          )}
        >
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs text-white/40">
            {description}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-primaryColor" : "bg-white/15"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white shadow transition-all",
            checked ? "left-[18px]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}

/** Async type-ahead that resolves TMDB keywords/companies by name. */
export function SearchCombobox({
  placeholder,
  onSelect,
  search,
}: {
  placeholder: string;
  onSelect: (option: FilterOption) => void;
  search: (query: string) => Promise<FilterOption[]>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const found = await search(trimmed);
        if (!cancelled) setResults(found);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, search]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/30" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className={cn(inputClass, "pl-9")}
        />
        {loading ? (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-white/40" />
        ) : null}
      </div>

      {query.trim().length >= 2 ? (
        <ul className="custom-scrollbar max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-1">
          {results.length > 0 ? (
            results.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(option);
                    setQuery("");
                    setResults([]);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {option.name}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-xs text-white/35">
              {loading ? "Searching…" : "No matches"}
            </li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
