/**
 * Modal Component (T035)
 * Shared modal/dialog component with dark theme styling
 */

import { CSSProperties, useEffect, useRef } from 'react';
import { theme } from '../../styles/theme';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap implementation (WCAG 2.1 AA)
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Save currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element
    firstElement?.focus();

    modal.addEventListener('keydown', handleTab);
    return () => {
      modal.removeEventListener('keydown', handleTab);
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyle: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    maxWidth: '90%',
    maxHeight: '90%',
    overflow: 'auto',
    boxShadow: theme.shadows.lg,
    position: 'relative',
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  };

  const titleStyle: CSSProperties = {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    margin: 0,
  };

  const closeButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xl,
    cursor: 'pointer',
    padding: theme.spacing.sm,
    minWidth: theme.touchTarget.minWidth,
    minHeight: theme.touchTarget.minHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const contentStyle: CSSProperties = {
    color: theme.colors.textPrimary,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        ref={modalRef}
        style={modalStyle}
        onClick={(e) => {
          e.stopPropagation();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div style={headerStyle}>
          <h2 id="modal-title" style={titleStyle}>
            {title}
          </h2>
          <button
            style={closeButtonStyle}
            onClick={onClose}
            aria-label="閉じる"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.textSecondary;
            }}
          >
            ✕
          </button>
        </div>
        <div style={contentStyle}>{children}</div>
      </div>
    </div>
  );
}
