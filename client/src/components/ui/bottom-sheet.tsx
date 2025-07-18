import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, className }: BottomSheetProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className={cn(
          "relative w-full bg-white transform transition-transform duration-300 ease-out shadow-2xl overflow-y-auto",
          "md:max-w-4xl md:max-h-[90vh] md:rounded-2xl",
          "max-w-md rounded-t-3xl p-6 max-h-[95vh]",
          "animate-in slide-in-from-bottom md:animate-in md:fade-in-0 md:zoom-in-95",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6 md:hidden" />
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
