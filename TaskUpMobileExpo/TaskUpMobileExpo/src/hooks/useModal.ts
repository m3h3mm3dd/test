import { useState, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform, BackHandler } from 'react-native';
import { triggerImpact } from '../utils/HapticUtils';

interface UseModalOptions {
  initialState?: boolean;
  enableHaptics?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  closeOnBackButton?: boolean;
}

interface UseModalReturn {
  isVisible: boolean;
  showModal: () => void;
  hideModal: () => void;
  toggleModal: () => void;
  animatedValue: number;
}

/**
 * Enhanced hook to handle modal visibility with haptic feedback and callbacks
 */
const useModal = ({
  initialState = false,
  enableHaptics = true,
  onOpen,
  onClose,
  closeOnBackButton = true
}: UseModalOptions = {}): UseModalReturn => {
  const [isVisible, setIsVisible] = useState<boolean>(initialState);
  const [animatedValue, setAnimatedValue] = useState<number>(initialState ? 1 : 0);
  
  // Set up back button handling for Android
  useEffect(() => {
    if (Platform.OS !== 'android' || !closeOnBackButton) return;
    
    const handleBackButton = () => {
      if (isVisible) {
        hideModal();
        return true; // Prevent default back button behavior
      }
      return false; // Allow default back button behavior
    };
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    
    return () => backHandler.remove();
  }, [isVisible, closeOnBackButton]);
  
  const triggerHaptic = useCallback((style: Haptics.ImpactFeedbackStyle) => {
    if (enableHaptics && Platform.OS !== 'web') {
      triggerImpact(style);
    }
  }, [enableHaptics]);

  const showModal = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsVisible(true);
    setAnimatedValue(1);
    onOpen?.();
  }, [triggerHaptic, onOpen]);

  const hideModal = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setIsVisible(false);
    setAnimatedValue(0);
    onClose?.();
  }, [triggerHaptic, onClose]);

  const toggleModal = useCallback(() => {
    if (isVisible) {
      hideModal();
    } else {
      showModal();
    }
  }, [isVisible, showModal, hideModal]);

  return {
    isVisible,
    showModal,
    hideModal,
    toggleModal,
    animatedValue
  };
};

export default useModal;