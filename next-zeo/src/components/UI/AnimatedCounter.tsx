"use client";
import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';

export const AnimatedCounter: React.FC<{
  end: number;
  suffix?: string;
  label: string;
  duration?: number;
  dark?: boolean;
}> = ({ end, suffix = '', label, duration = 2500, dark = false }) => {
  const { count, ref } = useCountUp({
    end,
    suffix,
    duration,
    start: 0
  });

  return (
    <div ref={ref} className="group text-center">
      <div className={`text-2xl sm:text-3xl font-bold mb-1 transition-colors duration-300 ${dark ? 'text-white group-hover:text-primary' : 'text-gray-900 group-hover:text-primary'}`}>
        {count}
      </div>
      <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</div>
    </div>
  );
};
