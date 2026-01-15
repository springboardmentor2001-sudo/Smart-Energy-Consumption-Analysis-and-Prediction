import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, children, title, className }) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose} 
            />
            
            {/* Modal Content */}
            <div className={cn(
                "relative z-50 w-full max-w-lg transform overflow-hidden rounded-2xl border border-primary/20 bg-background/95 p-6 shadow-2xl backdrop-blur-xl transition-all animate-in zoom-in-95 duration-300",
                className
            )}>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold leading-none tracking-tight text-foreground">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 ring-offset-background transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>
                <div className="relative">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
