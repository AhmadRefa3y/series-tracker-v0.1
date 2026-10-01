"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type DashboardSection = { id: string; label: string };

/**
 * Sticky, glassy tab rail for the dashboard. Tracks which section is on screen
 * with an IntersectionObserver and slides a gold pill between tabs — the
 * closest thing to a native segmented control the web gives us.
 *
 * Only sections actually present in the DOM are shown, so rows that render
 * nothing (empty calendar/history) don't leave dead links behind.
 */
const DashboardSectionNav = ({
  sections,
}: {
  sections: DashboardSection[];
}) => {
  // Rendered with every section first so the rail reserves its space (no
  // layout shift), then narrowed to the sections that actually exist.
  const [visibleSections, setVisibleSections] =
    useState<DashboardSection[]>(sections);
  const [active, setActive] = useState(sections[0]?.id ?? "");

  // Drop tabs whose section never rendered.
  useEffect(() => {
    const present = sections.filter(
      (section) => document.getElementById(section.id) !== null
    );
    setVisibleSections(present);
    setActive(present[0]?.id ?? "");
  }, [sections]);

  useEffect(() => {
    const elements = visibleSections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const onScreen = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (onScreen[0]) setActive(onScreen[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.5, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleSections]);

  if (visibleSections.length < 2) return null;

  return (
    <div className="sticky top-16 z-40 border-b border-white/[0.05] bg-ink-900/65 backdrop-blur-2xl">
      <nav
        aria-label="Dashboard sections"
        className="no-scrollbar container mx-auto flex gap-1 overflow-x-auto px-4 py-3 md:px-6"
      >
        {visibleSections.map((section) => {
          const isActive = active === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-200",
                isActive
                  ? "text-secondaryColor"
                  : "text-white/55 hover:bg-white/[0.05] hover:text-white"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="dashboard-tab-pill"
                  className="absolute inset-0 rounded-full bg-primaryColor shadow-gold"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span className="relative z-10">{section.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardSectionNav;
