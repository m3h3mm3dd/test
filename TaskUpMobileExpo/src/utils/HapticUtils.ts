import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'

/**
 * Safely trigger impact haptic feedback
 * @param style - Impact feedback style (Light, Medium, or Heavy)
 */
export const triggerImpact = async (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
) => {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.impactAsync(style)
    } catch (error) {
      console.log('Haptic feedback unavailable', error)
    }
  }
}

/**
 * Safely trigger notification haptic feedback
 * @param type - Notification type (Success, Warning, or Error)
 */
export const triggerNotification = async (
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success
) => {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.notificationAsync(type)
    } catch (error) {
      console.log('Haptic feedback unavailable', error)
    }
  }
}

/**
 * Safely trigger selection haptic feedback
 */
export const triggerSelection = async () => {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.selectionAsync()
    } catch (error) {
      console.log('Haptic feedback unavailable', error)
    }
  }
}

/**
 * Trigger a sequence of haptic feedbacks with delays
 * @param sequence - Array of {type, style, delay} objects
 */
export const triggerSequence = async (
  sequence: Array<{
    type: 'impact' | 'notification' | 'selection'
    style?: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType
    delay: number
  }>
) => {
  if (Platform.OS === 'web') return

  for (const item of sequence) {
    await new Promise(resolve => setTimeout(resolve, item.delay))
    
    try {
      if (item.type === 'impact') {
        await Haptics.impactAsync(
          item.style as Haptics.ImpactFeedbackStyle || Haptics.ImpactFeedbackStyle.Light
        )
      } else if (item.type === 'notification') {
        await Haptics.notificationAsync(
          item.style as Haptics.NotificationFeedbackType || Haptics.NotificationFeedbackType.Success
        )
      } else if (item.type === 'selection') {
        await Haptics.selectionAsync()
      }
    } catch (error) {
      console.log('Haptic feedback unavailable', error)
    }
  }
}

/**
 * Trigger haptic feedback based on success or failure
 * @param success - Whether the operation was successful
 */
export const triggerResult = async (success: boolean) => {
  if (Platform.OS !== 'web') {
    try {
      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
    } catch (error) {
      console.log('Haptic feedback unavailable', error)
    }
  }
}

/**
 * Trigger warning haptic feedback
 */
export const triggerWarning = async () => {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    } catch (error) {
      console.log('Haptic feedback unavailable', error)
    }
  }
}

export default {
  triggerImpact,
  triggerNotification,
  triggerSelection,
  triggerSequence,
  triggerResult,
  triggerWarning
}