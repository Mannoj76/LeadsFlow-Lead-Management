import React, { useEffect, useRef, useState } from 'react';
import { cn } from './utils';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface InlineFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const InlineForm: React.FC<InlineFormProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  width = 'md',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeStartTime, setSwipeStartTime] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  // Handle escape key to close and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Auto-focus first input field after animation completes
  useEffect(() => {
    if (isOpen && panelRef.current) {
      // Wait for slide-in animation to complete (300ms)
      const focusTimer = setTimeout(() => {
        // Find first focusable element (input, textarea, select, button)
        const focusableElements = panelRef.current?.querySelectorAll(
          'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])'
        );

        if (focusableElements && focusableElements.length > 0) {
          // Focus the first element (usually the first input field)
          const firstElement = focusableElements[0] as HTMLElement;
          firstElement.focus();
        }
      }, 300);

      return () => clearTimeout(focusTimer);
    }
  }, [isOpen]);

  // Mobile swipe-to-close gesture (only on screens < 768px)
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const panel = panelRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      // Only track swipes that start from the panel edge (left 20px)
      const touch = e.touches[0];
      const rect = panel.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;

      if (touchX < 20) {
        setSwipeStartX(touch.clientX);
        setSwipeStartTime(Date.now());
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (swipeStartX === null) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - swipeStartX;

      // Only allow rightward swipes (positive deltaX)
      if (deltaX > 0) {
        setSwipeOffset(deltaX);
        // Prevent default to avoid scrolling while swiping
        if (deltaX > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (swipeStartX === null || swipeStartTime === null) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - swipeStartX;
      const deltaTime = Date.now() - swipeStartTime;
      const velocity = deltaX / deltaTime; // px/ms

      // Close if swipe distance > 100px OR velocity > 0.5px/ms
      if (deltaX > 100 || velocity > 0.5) {
        onClose();
      }

      // Reset swipe state
      setSwipeStartX(null);
      setSwipeStartTime(null);
      setSwipeOffset(0);
    };

    panel.addEventListener('touchstart', handleTouchStart, { passive: true });
    panel.addEventListener('touchmove', handleTouchMove, { passive: false });
    panel.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      panel.removeEventListener('touchstart', handleTouchStart);
      panel.removeEventListener('touchmove', handleTouchMove);
      panel.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, swipeStartX, swipeStartTime, onClose]);

  if (!isOpen) return null;

  // Width classes based on size prop
  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-5xl',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in-0 duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Panel */}
      <div
        ref={panelRef}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex flex-col',
          'bg-white shadow-2xl',
          'w-full sm:w-auto',
          widthClasses[width],
          'animate-in slide-in-from-right duration-300 ease-out',
          'transition-transform',
          className
        )}
        style={{
          transform: swipeOffset > 0 ? `translateX(${swipeOffset}px)` : undefined,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 id="panel-title" className="text-xl font-semibold text-white">
                {title}
              </h2>
              {description && (
                <p className="text-sm text-indigo-100 mt-1.5 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-white/90 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </div>
    </>
  );
};

interface CollapsibleSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  isOpen,
  onToggle,
  title,
  badge,
  children,
  className,
}) => {
  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}>
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">{title}</span>
          {badge}
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          )}
        </div>
      </button>
      <div
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-6 bg-white border-t border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

interface InlineFormContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const InlineFormContainer: React.FC<InlineFormContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
};

interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  submitDisabled = false,
  className,
}) => {
  return (
    <div className={cn('flex justify-end gap-3 pt-4 border-t border-gray-200', className)}>
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        {cancelLabel}
      </button>
      <button
        type={onSubmit ? 'button' : 'submit'}
        onClick={onSubmit}
        disabled={isSubmitting || submitDisabled}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </div>
  );
};

