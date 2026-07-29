'use client';
import { useEffect, useRef, useState } from 'react';

// Animates a number counting up from 0 to `value` once it scrolls into view.
// `decimals` lets it handle ratings like 4.7 as cleanly as whole counts like 21.
export default function CountUp({ value, decimals = 0, suffix = '', duration = 1200, className = '' }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const target = Number(value) || 0;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        function tick(now) {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - (1 - progress) * (1 - progress);
          setDisplay(target * eased);
          if (progress < 1) requestAnimationFrame(tick);
          else setDisplay(target);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <span ref={ref} className={className}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
