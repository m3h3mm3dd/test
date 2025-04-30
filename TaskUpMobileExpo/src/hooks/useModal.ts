
import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface UseModalOptions {
  initialState?: boolean;
  enableHaptics?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

interface UseModalReturn {
  isVisible: boolean;
  showModal: () => void;
  hideModal: () => void;
  toggleModal: () => void;
}

/**
 * Enhanced hook to handle modal visibility with haptic feedback and callbacks
 */
const useModal = ({
  initialState = false,
  enableHaptics = true,
  onOpen,
  onClose
}: UseModalOptions = {}): UseModalReturn => {
  const [isVisible, setIsVisible] = useState<boolean>(initialState);

  const triggerHaptic = useCallback(async (style: Haptics.ImpactFeedbackStyle) => {
    if (enableHaptics && Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(style);
      } catch (error) {
        console.warn('Haptic feedback unavailable', error);
      }
    }
  }, [enableHaptics]);

  const showModal = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsVisible(true);
    onOpen?.();
  }, [triggerHaptic, onOpen]);

  const hideModal = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setIsVisible(false);
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
    toggleModal
  };
};

export default useModal;