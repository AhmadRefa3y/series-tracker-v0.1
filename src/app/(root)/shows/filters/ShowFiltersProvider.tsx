"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  DEFAULT_SORT,
  LIST_FILTER_KEYS,
  countActiveFilters,
  parseShowFilters,
  type FilterOptions,
  type ShowFilterState,
} from "../filterConfig";

/** id -> human name, keyed by `<paramKey>:<id>` so ids from different searches never collide. */
type NameMap = Record<string, string>;

interface ShowFiltersContextValue {
  filters: ShowFilterState;
  options: FilterOptions;
  isLoggedIn: boolean;
  isPending: boolean;
  activeCount: number;
  /** Set or clear a scalar parameter. Passing null/"" removes it. */
  setParam: (key: string, value: string | number | null | undefined) => void;
  /** Toggle an id/value inside a comma-separated list parameter. */
  toggleListValue: (key: string, value: string | number, name?: string) => void;
  /** Replace a comma-separated list parameter wholesale. */
  setListValues: (key: string, values: Array<string | number>) => void;
  /** Remove a single value (list) or clear the whole parameter (scalar). */
  removeFilter: (key: string, value?: string | number) => void;
  /** Reset everything to defaults. */
  clearAll: () => void;
  /** Human name for a searched id (keyword/company), if known this session. */
  getName: (key: string, id: string | number) => string | undefined;
}

const ShowFiltersContext = createContext<ShowFiltersContextValue | null>(null);

const splitList = (raw: string | null) =>
  (raw ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

/** Remove empty/duplicate noise so the URL stays tidy and stable. */
function sanitize(params: URLSearchParams) {
  for (const key of Array.from(params.keys())) {
    const value = params.get(key);
    if (value === null || value.trim() === "") {
      params.delete(key);
      continue;
    }
    if (key === "sort_by" && value === DEFAULT_SORT) params.delete(key);
    if (
      (LIST_FILTER_KEYS as readonly string[]).includes(key) &&
      splitList(value).length === 0
    ) {
      params.delete(key);
    }
  }
  // A watch region is only meaningful together with providers.
  if (!params.get("with_watch_providers")) params.delete("watch_region");
}

export function ShowFiltersProvider({
  options,
  isLoggedIn,
  children,
}: {
  options: FilterOptions;
  isLoggedIn: boolean;
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // `params` is the optimistic, immediately-updated source of truth for the UI.
  // `paramsRef` mirrors it so rapid successive clicks never read stale state.
  const [params, setParams] = useState<URLSearchParams>(
    () => new URLSearchParams(searchParams.toString())
  );
  const paramsRef = useRef(params);
  const lastPushedRef = useRef(searchParams.toString());
  const [names, setNames] = useState<NameMap>({});

  const updateParams = useCallback((next: URLSearchParams) => {
    paramsRef.current = next;
    setParams(next);
  }, []);

  // Back/forward (and any URL change that bypasses our own router.replace)
  // re-syncs the UI from the address bar.
  useEffect(() => {
    const handlePopState = () => {
      const current = window.location.search.replace(/^\?/, "");
      lastPushedRef.current = current;
      updateParams(new URLSearchParams(current));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [updateParams]);

  const commit = useCallback(
    (next: URLSearchParams) => {
      next.delete("page"); // Any filter change returns to the first page.
      sanitize(next);
      const query = next.toString();

      updateParams(new URLSearchParams(query)); // Instant, optimistic UI.

      if (query === lastPushedRef.current) return;
      lastPushedRef.current = query;

      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, updateParams]
  );

  const setParam = useCallback(
    (key: string, value: string | number | null | undefined) => {
      const next = new URLSearchParams(paramsRef.current.toString());
      if (value === null || value === undefined || `${value}`.trim() === "") {
        next.delete(key);
      } else {
        next.set(key, `${value}`);
      }
      commit(next);
    },
    [commit]
  );

  const toggleListValue = useCallback(
    (key: string, value: string | number, name?: string) => {
      const id = `${value}`;
      const current = splitList(paramsRef.current.get(key));
      const exists = current.includes(id);
      const updated = exists
        ? current.filter((entry) => entry !== id)
        : [...current, id];

      if (name) {
        setNames((prev) => {
          const next = { ...prev };
          if (exists) delete next[`${key}:${id}`];
          else next[`${key}:${id}`] = name;
          return next;
        });
      }

      const next = new URLSearchParams(paramsRef.current.toString());
      if (updated.length === 0) next.delete(key);
      else next.set(key, updated.join(","));
      commit(next);
    },
    [commit]
  );

  const setListValues = useCallback(
    (key: string, values: Array<string | number>) => {
      const next = new URLSearchParams(paramsRef.current.toString());
      if (values.length === 0) next.delete(key);
      else next.set(key, values.map(String).join(","));
      commit(next);
    },
    [commit]
  );

  const removeFilter = useCallback(
    (key: string, value?: string | number) => {
      const next = new URLSearchParams(paramsRef.current.toString());
      if (value === undefined) {
        next.delete(key);
      } else {
        const remaining = splitList(next.get(key)).filter(
          (entry) => entry !== `${value}`
        );
        if (remaining.length === 0) next.delete(key);
        else next.set(key, remaining.join(","));
      }
      commit(next);
    },
    [commit]
  );

  const clearAll = useCallback(() => {
    commit(new URLSearchParams()); // Resets filters and pagination.
  }, [commit]);

  const filters = useMemo(() => parseShowFilters(params), [params]);
  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  const getName = useCallback(
    (key: string, id: string | number) => names[`${key}:${id}`],
    [names]
  );

  const value = useMemo<ShowFiltersContextValue>(
    () => ({
      filters,
      options,
      isLoggedIn,
      isPending,
      activeCount,
      setParam,
      toggleListValue,
      setListValues,
      removeFilter,
      clearAll,
      getName,
    }),
    [
      filters,
      options,
      isLoggedIn,
      isPending,
      activeCount,
      setParam,
      toggleListValue,
      setListValues,
      removeFilter,
      clearAll,
      getName,
    ]
  );

  return (
    <ShowFiltersContext.Provider value={value}>
      {children}
    </ShowFiltersContext.Provider>
  );
}

export function useShowFilters() {
  const context = useContext(ShowFiltersContext);
  if (!context) {
    throw new Error("useShowFilters must be used within ShowFiltersProvider");
  }
  return context;
}
