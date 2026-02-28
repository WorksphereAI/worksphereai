import { useAnimation, useInView, type Variants, type Transition } from 'framer-motion';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

// Apple-style easing curve
const appleEase: [number, number, number, number] = [0.4, 0.0, 0.2, 1];
const appleEaseOut: [number, number, number, number] = [0.0, 0.0, 0.2, 1];
const appleEaseIn: [number, number, number, number] = [0.4, 0.0, 1, 1];

// Transition presets
export const smoothTransition: Transition = {
  duration: 0.4,
  ease: appleEase
};

export const fastTransition: Transition = {
  duration: 0.2,
  ease: appleEaseOut
};

export const springTransition: Transition = {
  type: 'spring',
  damping: 25,
  stiffness: 300
};

export const loadingTransition: Transition = {
  duration: 1,
  ease: 'linear',
  repeat: Infinity
};

export const pulseTransition: Transition = {
  duration: 2,
  ease: 'easeInOut',
  repeat: Infinity
};

// Animation variants
export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition
  }
};

export const fadeIn: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition
  }
};

export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -50 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition
  }
};

export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 50 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition
  }
};

export const slideInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: appleEase }
  }
};

export const slideInDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -30 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: appleEase }
  }
};

export const staggerContainer: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Loading animation variants
export const loadingVariants: Variants = {
  initial: { 
    rotate: 0 
  },
  animate: {
    rotate: 360,
    transition: loadingTransition
  }
};

// Pulse animation for notifications
export const pulseVariants: Variants = {
  initial: { 
    scale: 1 
  },
  animate: {
    scale: [1, 1.05, 1],
    transition: pulseTransition
  }
};

// Custom hooks
export const useAppleAnimation = (threshold = 0.1, triggerOnce = true) => {
  const controls = useAnimation();
  const ref = useRef(null);
  
  // Properly typed useInView
  const inView = useInView(ref, { 
    once: triggerOnce,
    amount: threshold
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return { ref, controls };
};

export const useStaggeredAnimation = (staggerDelay = 0.1) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: smoothTransition
    }
  };

  return { containerVariants, itemVariants };
};

// Page transition component
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: appleEaseOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hover animation hook
export const useHoverAnimation = (scale = 1.02, tapScale = 0.98) => {
  return {
    hover: { 
      scale, 
      transition: { duration: 0.2, ease: appleEaseOut } 
    },
    tap: { 
      scale: tapScale, 
      transition: { duration: 0.1 } 
    }
  };
};

// Entrance animation hook
export const useEntranceAnimation = (direction: 'up' | 'down' | 'left' | 'right' | 'fade' = 'fade', delay = 0) => {
  let variants: Variants;
  
  switch (direction) {
    case 'up':
      variants = slideInUp;
      break;
    case 'down':
      variants = slideInDown;
      break;
    case 'left':
      variants = slideInLeft;
      break;
    case 'right':
      variants = slideInRight;
      break;
    default:
      variants = fadeIn;
  }

  const customVariants: Variants = {
    hidden: variants.hidden,
    visible: {
      ...(variants.visible as any),
      transition: {
        ...((variants.visible as any)?.transition || {}),
        delay
      }
    }
  };

  return customVariants;
};

// List animation hook
export const useListAnimation = (staggerDelay = 0.05) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: fastTransition
    }
  };

  return { containerVariants, itemVariants };
};

// Modal animation hook
export const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
      delay: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: appleEaseIn
    }
  }
};

// Backdrop animation variants
export const backdropVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Slide panel animation (for side drawers)
export const slidePanelVariants = (direction: 'left' | 'right' = 'right'): Variants => {
  const xValue = direction === 'left' ? -300 : 300;
  
  return {
    hidden: { 
      x: xValue,
      opacity: 0
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200
      }
    },
    exit: {
      x: xValue,
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: appleEaseIn
      }
    }
  };
};

// Notification toast animation
export const toastVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: appleEaseIn
    }
  }
};

// Counter animation hook (for numbers)
export const useCounterAnimation = (from: number, to: number, duration = 1) => {
  const ref = useRef<HTMLSpanElement>(null);
  const controls = useAnimation();
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        transition: { duration }
      });
      
      // Animate the number
      let startTime: number | null = null;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const currentValue = Math.floor(from + (to - from) * progress);
        
        if (ref.current) {
          ref.current.textContent = currentValue.toString();
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [inView, from, to, duration, controls]);

  return { ref, controls };
};

// Scroll reveal hook
export const useScrollReveal = (threshold = 0.2) => {
  const ref = useRef(null);
  const controls = useAnimation();
  const inView = useInView(ref, { 
    once: true,
    amount: threshold
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const variants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ...smoothTransition,
        delay: 0.1
      }
    }
  };

  return { ref, controls, variants };
};