import { useBreakpoint } from './use-breakpoint';
import { useWindowSize } from './use-window-size';

export interface ScreenSize {
  width: number | undefined;
  height: number | undefined;
  breakpoint: ReturnType<typeof useBreakpoint>;
  /** < 768px */
  isMobile: boolean;
  /** 768px – 1023px */
  isTablet: boolean;
  /** ≥ 1024px */
  isDesktop: boolean;
  /** ≥ 1280px */
  isLargeDesktop: boolean;
}

/** Combines window dimensions and Tailwind breakpoint into a single convenient hook. */
export function useScreenSize(): ScreenSize {
  const { width, height } = useWindowSize();
  const breakpoint = useBreakpoint();
  const w = width ?? 0;

  return {
    width,
    height,
    breakpoint,
    isMobile: w < 768,
    isTablet: w >= 768 && w < 1024,
    isDesktop: w >= 1024,
    isLargeDesktop: w >= 1280,
  };
}
