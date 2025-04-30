import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEvent, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface KeyboardInfo {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
  keyboardAnimationDuration: number;
  visibleScreenHeight: number;
  keyboardShown: () => void;
  keyboardHidden: () => void;
}

/**
 * Hook to track keyboard visibility and height with smooth animations
 */
const useKeyboard = (): KeyboardInfo => {
  const [keyboardInfo, setKeyboardInfo] = useState<KeyboardInfo>({
    isKeyboardVisible: false,
    keyboardHeight: 0,
    keyboardAnimationDuration: 250,
    visibleScreenHeight: Dimensions.get('window').height,
    keyboardShown: () => {},
    keyboardHidden: () => {}
  });
  
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  const keyboardShown = () => {
    // This function can be called by the component using this hook
    // to handle any additional logic when keyboard shows
  };
  
  const keyboardHidden = () => {
    // This function can be called by the component using this hook
    // to handle any additional logic when keyboard hides
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    
    const handleKeyboardShow = (event: KeyboardEvent) => {
      const keyboardHeight = event.endCoordinates.height;
      const visibleHeight = screenHeight - keyboardHeight;
      const duration = event.duration || 250;
      
      setKeyboardInfo(prev => ({
        ...prev,
        isKeyboardVisible: true,
        keyboardHeight,
        keyboardAnimationDuration: duration,
        visibleScreenHeight: visibleHeight
      }));
      
      keyboardShown();
    };
    
    const handleKeyboardHide = (event: KeyboardEvent) => {
      const duration = event.duration || 250;
      
      setKeyboardInfo(prev => ({
        ...prev,
        isKeyboardVisible: false,
        keyboardHeight: 0,
        keyboardAnimationDuration: duration,
        visibleScreenHeight: screenHeight
      }));
      
      keyboardHidden();
    };

    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    // Cleanup subscriptions
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [screenHeight]);

  return {
    ...keyboardInfo,
    keyboardShown,
    keyboardHidden
  };
};

export default useKeyboard;