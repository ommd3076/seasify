import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

export interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  'data-testid'?: string;
}

export const PRESET_RANGES = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last 12 Months' },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  className = '',
  'data-testid': testId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = PRESET_RANGES.find((r) => r.value === value) || PRESET_RANGES[2];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
      data-testid={testId || 'date-range-picker'}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F7F9F6] border border-[#D9DEDA] shadow-sm hover:border-[#68DD79] transition text-sm font-medium text-[#171A18] focus:outline-none cursor-pointer select-none"
      >
        <Calendar className="w-4 h-4 text-[#737A75]" />
        <span>{selected.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#737A75] transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-card bg-[#F7F9F6] border border-[#D9DEDA] shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-2 z-50 animate-in fade-in duration-100">
          {PRESET_RANGES.map((range) => {
            const isSelected = range.value === value;
            return (
              <button
                key={range.value}
                type="button"
                onClick={() => {
                  onChange(range.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#A5F5A6]/40 font-semibold text-[#171A18]'
                    : 'text-[#171A18] hover:bg-[#EAEFEC]'
                }`}
              >
                <span>{range.label}</span>
                {isSelected && <Check className="w-4 h-4 text-[#171A18] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
