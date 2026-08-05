/**
 * Shims for the standalone preview bundle (see preview/README.md).
 *
 * The preview renders the real section components outside Next.js, so the two
 * Next-only imports they use need plain-React equivalents. Nothing here is
 * used by the actual site.
 */
import { Suspense, lazy, type ComponentType } from "react";

/** Stand-in for next/dynamic: same call shape, React.lazy underneath. */
export function dynamic<P extends object>(
  loader: () => Promise<ComponentType<P>>,
  options?: { ssr?: boolean; loading?: () => React.ReactNode },
) {
  const Lazy = lazy(async () => ({ default: await loader() }));
  return function Dynamic(props: P) {
    return (
      <Suspense fallback={options?.loading ? options.loading() : null}>
        <Lazy {...props} />
      </Suspense>
    );
  };
}

/** Stand-in for next/link: an anchor is all the site actually needs. */
export function Link({
  href,
  children,
  ...rest
}: React.ComponentProps<"a"> & { href: string }) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
