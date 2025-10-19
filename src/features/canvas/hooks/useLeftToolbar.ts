// Left toolbar hook - manages tool selection and keyboard shortcuts
'use client';

import { useState, useEffect } from 'react';

export type ToolType = 'select' | 'rectangle' | 'circle' | 'pan';

interface LeftToolbarState {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

interface UseLeftToolbarOptions {
  /** Initial tool (default: 'select') */
  initialTool?: ToolType;
  /** External tool state setter for synchronization */
  onToolChange?: (tool: ToolType) => void;
}

/**
 * Hook to manage left toolbar tool selection
 * Handles keyboard shortcuts: V (select), R (rectangle), C (circle), H (pan)
 */
export function useLeftToolbar(options?: UseLeftToolbarOptions): LeftToolbarState {
  const [activeTool, setActiveTool] = useState<ToolType>(options?.initialTool || 'select');
  
  // Wrapper to notify parent component of tool changes
  const handleSetActiveTool = (tool: ToolType) => {
    setActiveTool(tool);
    options?.onToolChange?.(tool);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Handle keyboard shortcuts
      switch (e.key.toLowerCase()) {
        case 'v':
          handleSetActiveTool('select');
          break;
        case 'r':
          handleSetActiveTool('rectangle');
          break;
        case 'c':
          handleSetActiveTool('circle');
          break;
        case 'h':
          handleSetActiveTool('pan');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    activeTool,
    setActiveTool: handleSetActiveTool,
  };
}

