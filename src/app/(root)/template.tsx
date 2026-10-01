/**
 * Route-level template: Next.js re-mounts this on every navigation inside
 * `(root)`, so the CSS entrance replays for each page — a short, native-feeling
 * fade + lift.
 *
 * Deliberately pure CSS (and `motion-safe:` gated): the markup is identical on
 * the server and the client, so it can never cause a hydration mismatch, and
 * reduced-motion users simply get no animation instead of a broken transition.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-1 flex-col motion-safe:animate-page-in">
      {children}
    </div>
  );
}
