'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * IntersectionObserver hook for viewport-based lazy loading.
 * Returns a ref to attach to an element and a boolean indicating visibility.
 * Once visible, stays true (one-shot).
 */
export function useViewportLazy(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.05, rootMargin: '150px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, isVisible };
}
