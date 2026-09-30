"use client";

import { Loader2, X } from "lucide-react";

import {
  DEFAULT_SORT,
  MONETIZATION_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  type FilterOption,
} from "../filterConfig";
import { useShowFilters } from "./ShowFiltersProvider";

interface ActiveChip {
  key: string;
  value?: string | number;
  label: string;
}

const nameById = (list: FilterOption[], id: string | number) =>
  list.find((option) => `${option.id}` === `${id}`)?.name;

const labelByValue = (
  list: { value: string; label: string }[],
  value: string | number | undefined
) => list.find((option) => option.value === `${value}`)?.label;

function buildChips(
  filters: ReturnType<typeof useShowFilters>["filters"],
  options: ReturnType<typeof useShowFilters>["options"],
  getName: ReturnType<typeof useShowFilters>["getName"]
): ActiveChip[] {
  const chips: ActiveChip[] = [];
  const add = (key: string, label: string, value?: string | number) =>
    chips.push({ key, value, label });

  if (filters.sortBy !== DEFAULT_SORT) {
    add("sort_by", `Sort: ${labelByValue(SORT_OPTIONS, filters.sortBy)}`);
  }

  for (const id of filters.withGenres) {
    add(
      "with_genres",
      nameById(options.genres, id) ?? `#${id}`,
      id
    );
  }
  for (const id of filters.withoutGenres) {
    add(
      "without_genres",
      `Not ${nameById(options.genres, id) ?? `#${id}`}`,
      id
    );
  }
  for (const id of filters.withType) {
    add("with_type", labelByValue(TYPE_OPTIONS, id) ?? `${id}`, id);
  }
  for (const id of filters.withStatus) {
    add("with_status", labelByValue(STATUS_OPTIONS, id) ?? `${id}`, id);
  }
  for (const id of filters.withNetworks) {
    add("with_networks", nameById(options.networks, id) ?? `#${id}`, id);
  }

  if (filters.firstAirDateYear) {
    add("first_air_date_year", `Year: ${filters.firstAirDateYear}`);
  }
  if (filters.firstAirDateGte) {
    add("first_air_date.gte", `From ${filters.firstAirDateGte}`);
  }
  if (filters.firstAirDateLte) {
    add("first_air_date.lte", `Until ${filters.firstAirDateLte}`);
  }
  if (filters.voteAverageGte) {
    add("vote_average.gte", `Rating ≥ ${filters.voteAverageGte}`);
  }
  if (filters.voteAverageLte) {
    add("vote_average.lte", `Rating ≤ ${filters.voteAverageLte}`);
  }
  if (filters.voteCountGte) {
    add("vote_count.gte", `Votes ≥ ${filters.voteCountGte}`);
  }
  if (filters.voteCountLte) {
    add("vote_count.lte", `Votes ≤ ${filters.voteCountLte}`);
  }
  if (filters.runtimeGte) {
    add("with_runtime.gte", `Runtime ≥ ${filters.runtimeGte}m`);
  }
  if (filters.runtimeLte) {
    add("with_runtime.lte", `Runtime ≤ ${filters.runtimeLte}m`);
  }
  if (filters.originalLanguage) {
    add(
      "with_original_language",
      `Language: ${
        nameById(options.languages, filters.originalLanguage) ??
        filters.originalLanguage
      }`
    );
  }

  for (const id of filters.withKeywords) {
    add(
      "with_keywords",
      `Keyword: ${getName("with_keywords", id) ?? `#${id}`}`,
      id
    );
  }
  for (const id of filters.withoutKeywords) {
    add(
      "without_keywords",
      `Not keyword: ${getName("without_keywords", id) ?? `#${id}`}`,
      id
    );
  }
  for (const id of filters.withCompanies) {
    add(
      "with_companies",
      `Studio: ${getName("with_companies", id) ?? `#${id}`}`,
      id
    );
  }
  for (const id of filters.withoutCompanies) {
    add(
      "without_companies",
      `Not studio: ${getName("without_companies", id) ?? `#${id}`}`,
      id
    );
  }

  if (filters.withWatchProviders.length > 0 && filters.watchRegion) {
    add(
      "watch_region",
      `Region: ${
        nameById(options.countries, filters.watchRegion) ??
        filters.watchRegion
      }`
    );
  }
  for (const id of filters.withWatchProviders) {
    add(
      "with_watch_providers",
      `On ${nameById(options.watchProviders, id) ?? `#${id}`}`,
      id
    );
  }
  for (const value of filters.watchMonetization) {
    add(
      "with_watch_monetization_types",
      labelByValue(MONETIZATION_OPTIONS, value) ?? value,
      value
    );
  }

  if (filters.includeAdult) add("include_adult", "Adult content");
  if (filters.includeNullFirstAirDates) {
    add("include_null_first_air_dates", "Unreleased dates");
  }
  if (filters.excludeTracked) {
    add("exclude_tracked", "Hiding my watchlist");
  }

  return chips;
}

export default function ActiveFilters() {
  const { filters, options, activeCount, isPending, removeFilter, clearAll, getName } =
    useShowFilters();

  const chips = buildChips(filters, options, getName);

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-white/45">
          {isPending ? (
            <span className="inline-flex items-center gap-1.5 text-primaryColor">
              <Loader2 className="size-3.5 animate-spin" />
              Updating results…
            </span>
          ) : activeCount > 0 ? (
            `${chips.length} filter${chips.length === 1 ? "" : "s"} applied`
          ) : (
            "No filters applied"
          )}
        </p>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-white/50 transition-colors hover:text-primaryColor"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={`${chip.key}:${chip.value ?? ""}`}
              type="button"
              onClick={() => removeFilter(chip.key, chip.value)}
              className="group inline-flex items-center gap-1.5 rounded-full border border-primaryColor/30 bg-primaryColor/[0.08] py-1 pr-2 pl-3 text-xs font-medium text-primaryColor transition-colors hover:border-primaryColor/60 hover:bg-primaryColor/15"
            >
              {chip.label}
              <X className="size-3 opacity-60 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
