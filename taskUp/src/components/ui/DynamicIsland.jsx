import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../styles/iosStyles';

/**
 * DynamicIsland component
 * 
 * This component emulates iOS Dynamic Island to display notifications,
 * status updates, and interactive content.
 * 
 * @param {boolean} isVisible - Whether the component is visible
 * @param {string} variant - Variant style ('standard', 'expanded', 'minimal')
 * @param {React.ReactNode} icon - Icon to display 
 * @param {React.ReactNode} content - Content to display inside
 * @param {function} onAction - Function to call when the island is clicked
 * @param {function} onClose - Function to call when close button is clicked
 * @param {number} autoHideDuration - Duration in ms before auto-hiding (0 to disable)
 */
const DynamicIsland = ({
  isVisible = false,
  variant = 'standard',
  icon,
  content,
  onAction,
  onClose,
  autoHideDuration = 0
}) => {
  const [portalElement, setPortalElement] = useState(null);
  
  // Find or create portal element in DOM
  useEffect(() => {
    let element = document.getElementById('dynamic-island-portal');
    if (!element) {
      element = document.createElement('div');
      element.id = 'dynamic-island-portal';
      element.style.position = 'fixed';
      element.style.top = '16px';
      element.style.left = '50%';
      element.style.transform = 'translateX(-50%)';
      element.style.zIndex = '9999';
      element.style.width = '100%';
      element.style.pointerEvents = 'none';
      element.style.display = 'flex';
      element.style.justifyContent = 'center';
      document.body.appendChild(element);
    }
    setPortalElement(element);
    
    // Cleanup
    return () => {
      // Only remove if we created it and it's still there
      if (document.getElementById('dynamic-island-portal') && !document.getElementById('dynamic-island-portal').childNodes.length) {
        document.body.removeChild(element);
      }
    };
  }, []);
  
  // Auto-hide functionality
  useEffect(() => {
    if (!isVisible || autoHideDuration === 0) return;
    
    const timer = setTimeout(() => {
      onClose && onClose();
    }, autoHideDuration);
    
    return () => clearTimeout(timer);
  }, [isVisible, autoHideDuration, onClose]);
  
  // Define variants for different states
  const variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: -20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -10,
      transition: { duration: 0.2 }
    }
  };
  
  // Configure size and appearance based on variant
  const getWidthByVariant = () => {
    switch (variant) {
      case 'minimal': return 'w-auto min-w-[120px]';
      case 'expanded': return 'w-[90%] max-w-[500px]';
      case 'standard':
      default: return 'w-[90%] max-w-[380px]';
    }
  };
  
  const getHeightByVariant = () => {
    switch (variant) {
      case 'minimal': return 'h-[36px]';
      case 'expanded': return 'min-h-[120px]';
      case 'standard':
      default: return 'min-h-[56px]';
    }
  };
  
  // Return null if portal element doesn't exist yet
  if (!portalElement) return null;
  
  // Create portal to render dynamic island
  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ 
            type: 'spring', 
            damping: 20, 
            stiffness: 300 
          }}
          className={`
            ${getWidthByVariant()}
            ${getHeightByVariant()}
            pointer-events-auto
            flex items-center justify-center
            px-4
            overflow-hidden
          `}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            borderRadius: '30px',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          }}
          onClick={() => onAction && onAction()}
        >
          <div className="flex items-center justify-between w-full">
            {icon && (
              <div className="mr-3 flex-shrink-0">
                {icon}
              </div>
            )}
            
            <div className="flex-1 text-white">
              {content}
            </div>
            
            {onClose && (
              <button 
                className="ml-3 p-1 hover:bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalElement
  );
};

export default DynamicIsland;