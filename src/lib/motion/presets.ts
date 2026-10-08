import type { Transition, Variants } from "motion/react";
import { motion } from "motion/react";

/* Duraciones (ver SISTEMA_DISENO_FINWISE.md §54) */
export const DURATION = {
  micro: 0.14,
  hover: 0.16,
  reveal: 0.2,
  page: 0.26,
  sheet: 0.3,
  counter: 0.4,
  chart: 0.5,
} as const;

/* Easing oficial: cubic-bezier(.2,.8,.2,1) */
export const EASING = "cubic-bezier(0.2, 0.8, 0.2, 1)" as const;

/* Springs suaves para sheets/sidebar/switches */
export const SPRING = {
  soft: { type: "spring" as const, stiffness: 320, damping: 34 },
  page: { type: "spring" as const, stiffness: 280, damping: 30 },
  sheet: { type: "spring" as const, stiffness: 300, damping: 38 },
} as const;

/* Transiciones reutilizables */
export const TRANSITIONS = {
  micro: { duration: DURATION.micro, easing: EASING } as Transition,
  reveal: { duration: DURATION.reveal, easing: EASING } as Transition,
  page: { duration: DURATION.page, easing: EASING } as Transition,
  spring: SPRING.soft as Transition,
  sheet: SPRING.sheet as Transition,
} as const;

/* Variants: page enter */
export const pageEnter: Variants = {
  hidden: { opacity: 0, translateY: 6 },
  visible: { opacity: 1, translateY: 0, transition: TRANSITIONS.page },
};

/* Variants: card reveal */
export const cardEnter: Variants = {
  hidden: { opacity: 0, translateY: 8 },
  visible: { opacity: 1, translateY: 0, transition: TRANSITIONS.reveal },
};

/* Variants: stagger container */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, translateY: 8 },
  visible: { opacity: 1, translateY: 0, transition: TRANSITIONS.reveal },
};

/* Variants: press feedback (scale 1 -> 0.98) */
export const press: Variants = {
  rest: { scale: 1 },
  press: { scale: 0.98, transition: TRANSITIONS.micro },
};

/* Variants: sheet spring */
export const sheetSpring: Variants = {
  hidden: { opacity: 0, translateY: 40 },
  visible: { opacity: 1, translateY: 0, transition: SPRING.sheet },
};

/* Variants: modal scale */
export const modalScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: TRANSITIONS.sheet },
};

/* Variants: fade in */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: TRANSITIONS.reveal },
};

/* Componentes envolventes reutilizables */
export const MotionPage = motion.div;
export const MotionCard = motion.div;
export const MotionFade = motion.div;

export const PRESETS = {
  pageEnter,
  cardEnter,
  staggerContainer,
  staggerChild,
  press,
  sheetSpring,
  modalScale,
  fadeIn,
  DURATION,
  EASING,
  SPRING,
  TRANSITIONS,
} as const;

export type PresetName = keyof typeof PRESETS;