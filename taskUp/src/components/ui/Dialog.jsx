import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import styles from '../../styles/iosStyles';

/**
 * iOS-style dialog/modal component
 * 
 * @param {boolean} isOpen - Whether the dialog is visible
 * @param {function} onClose - Function called when dialog is closed
 * @param {string} title - Dialog title
 * @param {React.ReactNode} children - Dialog content
 * @param {string} size - Dialog size (sm, md, lg, xl, full)
 * @param {React.ReactNode} footer - Custom footer content
 * @param {boolean} closeOnOverlayClick - Whether to close when clicking outside
 * @param {boolean} showCloseButton - Whether to show the close button
 * @param {boolean} centered - Whether to center the dialog vertically
 */
const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  closeOnOverlayClick = true,
  showCloseButton = true,
  centered = true,
  className = '',
  ...rest
}) => {
  const dialogRef = useRef(null);
  
  // Handle ESC key press to close dialog
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = ''; // Restore scrolling
    };
  }, [isOpen, onClose]);
  
  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose && onClose();
    }
  };
  
  // Get width based on size prop
  const getDialogWidth = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-full m-4';
      case 'md':
      default:
        return 'max-w-lg';
    }
  };
  
  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  const dialogVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: centered ? -20 : -10
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 500
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.98,
      transition: { 
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
          />
          
          {/* Dialog positioning container */}
          <div className={`fixed inset-0 p-4 ${centered ? 'flex items-center justify-center' : 'overflow-y-auto pt-16'}`}>
            {/* Dialog */}
            <motion.div
              ref={dialogRef}
              className={`w-full ${getDialogWidth()} bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden relative ${className}`}
              style={{
                maxHeight: size === 'full' ? '90vh' : undefined,
                ...(size === 'full' && { height: 'calc(100vh - 2rem)' })
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={dialogVariants}
              {...rest}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  {title && (
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
                  )}
                  
                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
              
              {/* Body */}
              <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
                {children}
              </div>
              
              {/* Footer */}
              {footer && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

/**
 * Dialog.Footer component for standard footer actions
 */
Dialog.Footer = ({ 
  cancelText = 'Cancel', 
  confirmText = 'Confirm', 
  onCancel, 
  onConfirm,
  confirmVariant = 'primary',
  isConfirmDisabled = false,
  isConfirmLoading = false,
  className = ''
}) => {
  return (
    <div className={`flex justify-end space-x-3 ${className}`}>
      {onCancel && (
        <Button 
          variant="secondary" 
          onClick={onCancel}
        >
          {cancelText}
        </Button>
      )}
      
      {onConfirm && (
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={isConfirmDisabled}
          isLoading={isConfirmLoading}
        >
          {confirmText}
        </Button>
      )}
    </div>
  );
};

export default Dialog;