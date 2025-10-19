// Left toolbar component - fixed toolbar with creation and manipulation tools
'use client';

import { MousePointer2, Square, Circle, Hand } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { ToolType } from '../hooks/useLeftToolbar';

interface LeftToolbarProps {
  /** Current active tool */
  activeTool?: ToolType;
  /** Callback when tool changes */
  onToolChange?: (tool: ToolType) => void;
}

interface Tool {
  id: ToolType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut: string;
}

const tools: Tool[] = [
  {
    id: 'select',
    icon: MousePointer2,
    label: 'Select',
    shortcut: 'V',
  },
  {
    id: 'rectangle',
    icon: Square,
    label: 'Rectangle',
    shortcut: 'R',
  },
  {
    id: 'circle',
    icon: Circle,
    label: 'Circle',
    shortcut: 'C',
  },
  {
    id: 'pan',
    icon: Hand,
    label: 'Pan',
    shortcut: 'H',
  },
];

/**
 * Left toolbar component with tool buttons
 * Always visible, fixed to the left side of the screen
 */
export function LeftToolbar({ activeTool = 'select', onToolChange }: LeftToolbarProps = {}) {

  return (
    <TooltipProvider>
      <div className="fixed left-0 top-16 w-[60px] h-[calc(100vh-64px)] bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2 z-40">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => onToolChange?.(tool.id)}
                  className="w-10 h-10"
                  aria-label={`${tool.label} tool`}
                >
                  <Icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>
                  {tool.label} <span className="text-xs text-gray-400">({tool.shortcut})</span>
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

