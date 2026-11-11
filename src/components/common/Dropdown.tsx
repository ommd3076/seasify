import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
  subtitle?: string;
}

export interface DropdownProps {
  options: Array<DropdownOption | string>;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  label?: string;
  className?: string;
  'data-testid'?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options: rawOptions,
  value,
  onChange,
  icon,
  placeholder = 'Select...',
  label,
  className = '',
  'data-testid': testId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options: DropdownOption[] = rawOptions.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = options.find((opt) => opt.value === value);

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
      data-testid={testId || 'dropdown'}
    >
      {label && (
        <label className="block text-[11px] font-semibold text-secondary-text uppercase tracking-wider mb-1">
          {label}
        </label>
      )}

      {/* Trigger Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F7F9F6] border border-[#D9DEDA] shadow-sm hover:border-[#68DD79] transition text-sm font-medium text-[#171A18] focus:outline-none cursor-pointer select-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {icon}
        <span className="truncate max-w-[150px]">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#737A75] transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-56 rounded-card bg-[#F7F9F6] border border-[#D9DEDA] shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-2 z-50 focus:outline-none animate-in fade-in duration-100"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#A5F5A6]/40 font-semibold text-[#171A18]'
                    : 'text-[#171A18] hover:bg-[#EAEFEC]'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="truncate">{option.label}</div>
                  {option.subtitle && (
                    <div className="text-[10px] text-[#737A75]">{option.subtitle}</div>
                  )}
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#171A18] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
