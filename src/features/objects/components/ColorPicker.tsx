// Color picker component
'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [tempColor, setTempColor] = useState(value);
  const [open, setOpen] = useState(false);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setTempColor(newColor);
    onChange(newColor); // Real-time update
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setTempColor(hex);
  };

  const handleHexBlur = () => {
    // Validate and update color if valid hex
    const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
    if (hexRegex.test(tempColor)) {
      onChange(tempColor);
    } else {
      // Reset to current value if invalid
      setTempColor(value);
    }
  };

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleHexBlur();
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-700">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-8 justify-start gap-2 px-3"
          >
            <div
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm text-gray-700">{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="color-picker" className="text-sm">
                Choose Color
              </Label>
              <input
                id="color-picker"
                type="color"
                value={tempColor}
                onChange={handleColorChange}
                className="w-full h-32 rounded cursor-pointer border border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hex-input" className="text-sm">
                Hex Code
              </Label>
              <Input
                id="hex-input"
                type="text"
                value={tempColor}
                onChange={handleHexInput}
                onBlur={handleHexBlur}
                onKeyDown={handleHexKeyDown}
                placeholder="#000000"
                className="h-8 text-sm font-mono"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

