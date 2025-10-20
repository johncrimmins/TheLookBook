'use client';

import { Button, ButtonProps } from './ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Button component with built-in loading state
 * Shows spinner and optional loading text when loading=true
 */
export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      className={cn(loading && 'cursor-not-allowed', className)}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
}

