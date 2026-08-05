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

/**
 * Stand-in for next/image. The real one pulls in Next runtime internals that
 * expect `process` to exist; the preview only needs the pixels.
 */
export function Img({
  src,
  alt,
  fill,
  // `sizes` drives next/image's srcset, which a plain <img> has no use for.
  sizes,
  ...rest
}: React.ComponentProps<"img"> & { fill?: boolean; sizes?: string }) {
  void sizes;

  const style = fill
    ? ({ position: "absolute", inset: 0, width: "100%", height: "100%" } as const)
    : undefined;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt ?? ""} style={style} {...rest} />;
}
