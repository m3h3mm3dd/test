import { useState, useCallback } from 'react'
import * as Haptics from 'expo-haptics'

interface UseModalReturn {
  isVisible: boolean
  showModal: () => void
  hideModal: () => void
  toggleModal: () => void
}

/**
 * Hook to handle modal visibility state with haptic feedback
 */
const useModal = (initialState: boolean = false): UseModalReturn => {
  const [isVisible, setIsVisible] = useState<boolean>(initialState)

  const showModal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsVisible(true)
  }, [])

  const hideModal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIsVisible(false)
  }, [])

  const toggleModal = useCallback(() => {
    Haptics.impactAsync(
      isVisible 
        ? Haptics.ImpactFeedbackStyle.Light 
        : Haptics.ImpactFeedbackStyle.Medium
    )
    setIsVisible(prev => !prev)
  }, [isVisible])

  return {
    isVisible,
    showModal,
    hideModal,
    toggleModal
  }
}

export default useModal