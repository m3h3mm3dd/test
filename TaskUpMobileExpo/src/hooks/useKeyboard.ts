
import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

interface KeyboardInfo {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

/**
 * Hook to track keyboard visibility and height with smooth animations
 */
const useKeyboard = (): KeyboardInfo => {
  const [keyboardInfo, setKeyboardInfo] = useState<KeyboardInfo>({
    isKeyboardVisible: false,
    keyboardHeight: 0
  });

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    
    const handleKeyboardShow = (event: KeyboardEvent) => {
      const keyboardHeight = event.endCoordinates.height;
      setKeyboardInfo({
        isKeyboardVisible: true,
        keyboardHeight
      });
    };
    
    const handleKeyboardHide = () => {
      setKeyboardInfo({
        isKeyboardVisible: false,
        keyboardHeight: 0
      });
    };

    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    // Cleanup subscriptions
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardInfo;
};

export default useKeyboard;