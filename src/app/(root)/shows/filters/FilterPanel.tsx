"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, RotateCcw, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { searchCompanies, searchKeywords } from "../filterSearchActions";
import {
  MONETIZATION_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  type FilterOption,
} from "../filterConfig";
import { useShowFilters } from "./ShowFiltersProvider";
import {
  ChipGroup,
  FilterChip,
  NumberField,
  SearchCombobox,
  SelectField,
  ToggleRow,
  inputClass,
} from "./controls";

function FilterSection({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/[0.06] px-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 py-3.5 text-left outline-none focus-visible:text-primaryColor"
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold tracking-wide text-white/75 uppercase">
          {title}
          {badge ? (
            <span className="rounded-full bg-primaryColor/20 px-1.5 py-0.5 text-[10px] font-bold text-primaryColor">
              {badge}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-white/40 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-medium tracking-wider text-white/40 uppercase">
      {children}
    </span>
  );
}

/** Active keyword/company pills with remove buttons. */
function SelectedIds({
  paramKey,
  ids,
}: {
  paramKey: string;
  ids: number[];
}) {
  const { removeFilter, getName } = useShowFilters();
  if (ids.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <FilterChip key={id} active onClick={() => removeFilter(paramKey, id)}>
          {getName(paramKey, id) ?? `#${id}`}
          <X className="size-3" />
        </FilterChip>
      ))}
    </div>
  );
}

export default function FilterPanel() {
  const {
    filters,
    options,
    isLoggedIn,
    activeCount,
    setParam,
    toggleListValue,
    clearAll,
  } = useShowFilters();

  const monetizationOptions: FilterOption[] = MONETIZATION_OPTIONS.map(
    (option) => ({ id: option.value, name: option.label })
  );
  const typeOptions: FilterOption[] = TYPE_OPTIONS.map((option) => ({
    id: option.value,
    name: option.label,
  }));
  const statusOptions: FilterOption[] = STATUS_OPTIONS.map((option) => ({
    id: option.value,
    name: option.label,
  }));

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white">Filters</h2>
          {activeCount > 0 ? (
            <span className="rounded-full bg-primaryColor px-1.5 py-0.5 text-[10px] font-bold text-secondaryColor">
              {activeCount}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={clearAll}
          disabled={activeCount === 0}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-white/50 transition-colors hover:text-primaryColor disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white/50"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>
      </div>

      <FilterSection title="Sort results" defaultOpen>
        <SelectField
          value={filters.sortBy}
          options={SORT_OPTIONS}
          onChange={(value) => setParam("sort_by", value || undefined)}
          includeEmpty={false}
        />
      </FilterSection>

      {isLoggedIn ? (
        <FilterSection
          title="My library"
          badge={filters.excludeTracked ? 1 : 0}
        >
          <ToggleRow
            label="Hide shows on my watchlist"
            description="Skip anything already tracked or watched"
            checked={filters.excludeTracked}
            onChange={(checked) =>
              setParam("exclude_tracked", checked ? "1" : undefined)
            }
          />
        </FilterSection>
      ) : null}

      <FilterSection title="Type & status">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <FieldLabel>Show type</FieldLabel>
            <ChipGroup
              options={typeOptions}
              selected={filters.withType}
              onToggle={(option) =>
                toggleListValue("with_type", option.id, option.name)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Airing status</FieldLabel>
            <ChipGroup
              options={statusOptions}
              selected={filters.withStatus}
              onToggle={(option) =>
                toggleListValue("with_status", option.id, option.name)
              }
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Genres" badge={filters.withGenres.length} defaultOpen>
        <ChipGroup
          options={options.genres}
          selected={filters.withGenres}
          initialLimit={16}
          onToggle={(option) =>
            toggleListValue("with_genres", option.id, option.name)
          }
        />
      </FilterSection>

      <FilterSection
        title="Exclude genres"
        badge={filters.withoutGenres.length}
      >
        <ChipGroup
          options={options.genres}
          selected={filters.withoutGenres}
          initialLimit={10}
          onToggle={(option) =>
            toggleListValue("without_genres", option.id, option.name)
          }
        />
      </FilterSection>

      <FilterSection title="Release date">
        <div className="flex flex-col gap-3">
          <NumberField
            label="Year"
            value={filters.firstAirDateYear}
            placeholder="e.g. 2024"
            min={1900}
            max={2100}
            onCommit={(value) => setParam("first_air_date_year", value)}
          />
          <label className="flex flex-col gap-1.5">
            <FieldLabel>From</FieldLabel>
            <input
              type="date"
              value={filters.firstAirDateGte}
              onChange={(event) =>
                setParam("first_air_date.gte", event.target.value)
              }
              className={cn(inputClass, "[color-scheme:dark]")}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>To</FieldLabel>
            <input
              type="date"
              value={filters.firstAirDateLte}
              onChange={(event) =>
                setParam("first_air_date.lte", event.target.value)
              }
              className={cn(inputClass, "[color-scheme:dark]")}
            />
          </label>
        </div>
      </FilterSection>

      <FilterSection title="Rating & votes">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <FieldLabel>Rating (0 – 10)</FieldLabel>
            <div className="flex gap-2">
              <NumberField
                label="Min"
                value={filters.voteAverageGte}
                placeholder="0"
                min={0}
                max={10}
                step={0.1}
                onCommit={(value) => setParam("vote_average.gte", value)}
              />
              <NumberField
                label="Max"
                value={filters.voteAverageLte}
                placeholder="10"
                min={0}
                max={10}
                step={0.1}
                onCommit={(value) => setParam("vote_average.lte", value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Vote count</FieldLabel>
            <div className="flex gap-2">
              <NumberField
                label="Min"
                value={filters.voteCountGte}
                placeholder="0"
                min={0}
                max={100000}
                step={50}
                onCommit={(value) => setParam("vote_count.gte", value)}
              />
              <NumberField
                label="Max"
                value={filters.voteCountLte}
                placeholder="Any"
                min={0}
                max={100000}
                step={50}
                onCommit={(value) => setParam("vote_count.lte", value)}
              />
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Runtime">
        <div className="flex gap-2">
          <NumberField
            label="Min (min)"
            value={filters.runtimeGte}
            placeholder="0"
            min={0}
            max={600}
            step={5}
            onCommit={(value) => setParam("with_runtime.gte", value)}
          />
          <NumberField
            label="Max (min)"
            value={filters.runtimeLte}
            placeholder="Any"
            min={0}
            max={600}
            step={5}
            onCommit={(value) => setParam("with_runtime.lte", value)}
          />
        </div>
      </FilterSection>

      <FilterSection title="Language">
        <SelectField
          value={filters.originalLanguage}
          options={options.languages.map((language) => ({
            value: `${language.id}`,
            label: language.name,
          }))}
          onChange={(value) => setParam("with_original_language", value)}
          placeholder="Any language"
        />
      </FilterSection>

      <FilterSection title="Network" badge={filters.withNetworks.length}>
        <ChipGroup
          options={options.networks}
          selected={filters.withNetworks}
          initialLimit={12}
          onToggle={(option) =>
            toggleListValue("with_networks", option.id, option.name)
          }
        />
      </FilterSection>

      <FilterSection title="Keywords" badge={filters.withKeywords.length + filters.withoutKeywords.length}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <FieldLabel>Must include</FieldLabel>
            <SearchCombobox
              placeholder="Search keywords…"
              search={searchKeywords}
              onSelect={(option) =>
                toggleListValue("with_keywords", option.id, option.name)
              }
            />
            <SelectedIds paramKey="with_keywords" ids={filters.withKeywords} />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Must exclude</FieldLabel>
            <SearchCombobox
              placeholder="Search keywords…"
              search={searchKeywords}
              onSelect={(option) =>
                toggleListValue("without_keywords", option.id, option.name)
              }
            />
            <SelectedIds
              paramKey="without_keywords"
              ids={filters.withoutKeywords}
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection
        title="Production company"
        badge={filters.withCompanies.length + filters.withoutCompanies.length}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <FieldLabel>Must include</FieldLabel>
            <SearchCombobox
              placeholder="Search companies…"
              search={searchCompanies}
              onSelect={(option) =>
                toggleListValue("with_companies", option.id, option.name)
              }
            />
            <SelectedIds paramKey="with_companies" ids={filters.withCompanies} />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Must exclude</FieldLabel>
            <SearchCombobox
              placeholder="Search companies…"
              search={searchCompanies}
              onSelect={(option) =>
                toggleListValue("without_companies", option.id, option.name)
              }
            />
            <SelectedIds
              paramKey="without_companies"
              ids={filters.withoutCompanies}
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection
        title="Where to watch"
        badge={
          filters.withWatchProviders.length +
          filters.watchMonetization.length
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Region"
            value={filters.watchRegion || "US"}
            options={options.countries.map((country) => ({
              value: `${country.id}`,
              label: country.name,
            }))}
            onChange={(value) => setParam("watch_region", value)}
            includeEmpty={false}
          />
          <div className="flex flex-col gap-2">
            <FieldLabel>Providers</FieldLabel>
            {filters.withWatchProviders.length > 0 ? (
              <SelectedIds
                paramKey="with_watch_providers"
                ids={filters.withWatchProviders}
              />
            ) : null}
            <ChipGroup
              options={options.watchProviders}
              selected={filters.withWatchProviders}
              initialLimit={12}
              emptyLabel="No providers for this region"
              onToggle={(option) =>
                toggleListValue("with_watch_providers", option.id, option.name)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Availability</FieldLabel>
            <ChipGroup
              options={monetizationOptions}
              selected={filters.watchMonetization}
              onToggle={(option) =>
                toggleListValue(
                  "with_watch_monetization_types",
                  option.id,
                  option.name
                )
              }
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Advanced">
        <div className="flex flex-col gap-2">
          <ToggleRow
            label="Include adult content"
            checked={filters.includeAdult}
            onChange={(checked) =>
              setParam("include_adult", checked ? "1" : undefined)
            }
          />
          <ToggleRow
            label="Include shows with no air date"
            checked={filters.includeNullFirstAirDates}
            onChange={(checked) =>
              setParam("include_null_first_air_dates", checked ? "1" : undefined)
            }
          />
        </div>
      </FilterSection>
    </div>
  );
}
