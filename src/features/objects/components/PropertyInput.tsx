// Property input component for numeric properties
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface PropertyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function PropertyInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: PropertyInputProps) {
  const [internalValue, setInternalValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Update internal value when external value changes (unless focused)
  useEffect(() => {
    if (!isFocused) {
      setInternalValue(value.toString());
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numValue = parseFloat(internalValue);
    
    if (!isNaN(numValue)) {
      // Apply min/max constraints
      let constrainedValue = numValue;
      if (min !== undefined) constrainedValue = Math.max(min, constrainedValue);
      if (max !== undefined) constrainedValue = Math.min(max, constrainedValue);
      
      onChange(constrainedValue);
      setInternalValue(constrainedValue.toString());
    } else {
      // Reset to previous valid value
      setInternalValue(value.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={label} className="text-xs font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={label}
          type="number"
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          min={min}
          max={max}
          step={step}
          className="h-8 text-sm pr-8"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

