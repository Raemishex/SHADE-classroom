// Centralized animation constants and helper curves (Emil Kowalski principles + GSAP)

export const EASE = {
  out: "power3.out",
  inOut: "power2.inOut",
  spring: "back.out(1.2)",
  soft: "sine.out",
  bounce: "elastic.out(1, 0.5)",
} as const;

export const DURATION = {
  instant: 0.1,  // 100ms
  micro: 0.16,   // 160ms
  fast: 0.22,    // 220ms
  normal: 0.35,  // 350ms
  slow: 0.6,     // 600ms
} as const;

export const STAGGER = {
  fast: 0.04,
  normal: 0.08,
  slow: 0.12,
} as const;

export const MOTION_VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: DURATION.fast } },
  },
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: DURATION.normal, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: DURATION.fast } },
  },
  slideUpDrawer: {
    initial: { y: "100%" },
    animate: { y: 0, transition: { duration: DURATION.normal, ease: [0.32, 0.72, 0, 1] } },
    exit: { y: "100%", transition: { duration: DURATION.fast } },
  },
};
