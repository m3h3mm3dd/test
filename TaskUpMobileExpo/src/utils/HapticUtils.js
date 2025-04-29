// src/utils/HapticUtils.js
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Safely trigger impact haptic feedback
 * @param {Haptics.ImpactFeedbackStyle} style - Light, Medium, or Heavy
 */
export const triggerImpact = async (style = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.impactAsync(style);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  }
};

/**
 * Safely trigger notification haptic feedback
 * @param {Haptics.NotificationFeedbackType} type - Success, Warning, or Error
 */
export const triggerNotification = async (type = Haptics.NotificationFeedbackType.Success) => {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.notificationAsync(type);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  }
};

/**
 * Safely trigger selection haptic feedback
 */
export const triggerSelection = async () => {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  }
};