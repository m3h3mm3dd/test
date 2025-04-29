import { useState, useEffect } from 'react'
import { Keyboard, KeyboardEvent, Platform } from 'react-native'

interface KeyboardInfo {
  isKeyboardVisible: boolean
  keyboardHeight: number
}

/**
 * Hook to track keyboard visibility and height
 */
const useKeyboard = (): KeyboardInfo => {
  const [keyboardInfo, setKeyboardInfo] = useState<KeyboardInfo>({
    isKeyboardVisible: false,
    keyboardHeight: 0
  })

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event: KeyboardEvent) => {
        const keyboardHeight = event.endCoordinates.height
        setKeyboardInfo({
          isKeyboardVisible: true,
          keyboardHeight
        })
      }
    )
    
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardInfo({
          isKeyboardVisible: false,
          keyboardHeight: 0
        })
      }
    )

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  return keyboardInfo
}

export default useKeyboard