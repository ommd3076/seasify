import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
  subtitle?: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  label,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {label && (
        <label className="block text-[11px] font-semibold text-secondary-text uppercase tracking-wider mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2.5 px-4 py-2 rounded-full bg-surface border border-border hover:bg-surface-muted text-xs font-medium text-primary-text shadow-xs transition-colors"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-secondary-text shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Options Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 bg-surface rounded-20px border border-border shadow-panel p-1.5 max-h-60 overflow-y-auto backdrop-blur-md">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-14px text-xs text-left transition-colors ${
                  isSelected
                    ? 'bg-charcoal text-white font-semibold'
                    : 'text-primary-text hover:bg-surface-muted'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="truncate">{option.label}</div>
                  {option.subtitle && (
                    <div className={`text-[10px] ${isSelected ? 'text-gray-300' : 'text-secondary-text'}`}>
                      {option.subtitle}
                    </div>
                  )}
                </div>
                {isSelected && <Check size={14} className="shrink-0 text-[#68DD79]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
