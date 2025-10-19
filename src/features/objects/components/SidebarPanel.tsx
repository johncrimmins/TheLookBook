// Sidebar panel component - generic collapsible panel for right sidebar
'use client';

import { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

/**
 * Props for SidebarPanel component
 * Generic component that can be reused for Properties and Layers panels
 */
export interface SidebarPanelProps {
  /** Panel title displayed in header */
  title: string;
  /** Whether the panel is expanded */
  isExpanded: boolean;
  /** Callback when panel is toggled */
  onToggle: () => void;
  /** Panel content */
  children: ReactNode;
}

/**
 * Generic collapsible sidebar panel
 * Used by both Properties and Layers panels
 * Critical for Feature 5B-2 - must remain generic and reusable
 */
export function SidebarPanel({ title, isExpanded, onToggle, children }: SidebarPanelProps) {
  return (
    <div className="flex flex-col border-b border-gray-200 last:border-b-0">
      {/* Header - clickable to toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
        aria-label={`Toggle ${title} panel`}
      >
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Content - with smooth transition */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {isExpanded && (
          <ScrollArea className="h-full">
            <div className="p-4">{children}</div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

