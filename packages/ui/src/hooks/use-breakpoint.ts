import { useEffect, useState } from 'react';

/** Tailwind CSS v3/v4 default breakpoints in px */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Returns the current active Tailwind breakpoint.
 * e.g. at 900px width → "md"
 * Returns `undefined` during SSR before hydration.
 */
export function useBreakpoint(): Breakpoint | undefined {
  const [breakpoint, setBreakpoint] = useState<Breakpoint | undefined>(undefined);

  useEffect(() => {
    function resolve(): Breakpoint {
      const w = window.innerWidth;
      if (w >= BREAKPOINTS['2xl']) return '2xl';
      if (w >= BREAKPOINTS.xl) return 'xl';
      if (w >= BREAKPOINTS.lg) return 'lg';
      if (w >= BREAKPOINTS.md) return 'md';
      if (w >= BREAKPOINTS.sm) return 'sm';
      return 'sm';
    }

    function update() {
      setBreakpoint(resolve());
    }

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return breakpoint;
}

/** Returns true when the viewport is at least the given breakpoint. */
export function useIsMinBreakpoint(bp: Breakpoint): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS[bp]}px)`);
    const onChange = () => setMatches(mql.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [bp]);

  return matches;
}
