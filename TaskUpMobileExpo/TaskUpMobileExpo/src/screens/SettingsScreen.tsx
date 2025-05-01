import React, { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  Switch, 
  ScrollView,
  Alert,
  Platform
} from 'react-native'
import Animated, { 
  FadeIn, 
  SlideInRight, 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSequence,
  FadeOut
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import AppInfo from '../constants/AppInfo'
import { triggerImpact } from '../utils/HapticUtils'
import { useColorScheme, useSetColorScheme, useToggleColorScheme } from '../hooks/useColorScheme'
import { useTheme } from '../hooks/useColorScheme'

type SettingCategory = 'appearance' | 'notifications' | 'feedback' | 'account' | 'privacy' | 'about'

interface SettingOption {
  key: string
  label: string
  icon: string
  description?: string
  type: 'switch' | 'select' | 'action'
  value?: boolean | string
  options?: { label: string; value: string }[]
  onPress?: () => void
}

interface SettingsSection {
  title: string
  icon: string
  color: string
  key: SettingCategory
  options: SettingOption[]
}

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

const SettingsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const setColorScheme = useSetColorScheme()
  const toggleColorScheme = useToggleColorScheme()
  const { colors, isDark } = useTheme()
  
  const [expandedSection, setExpandedSection] = useState<SettingCategory | null>(null)
  const headerHeight = useSharedValue(0)
  
  const [settings, setSettings] = useState({
    darkMode: isDark,
    notifications: true,
    soundEffects: true,
    hapticFeedback: true,
    dataSync: true,
    biometricAuth: false,
    autoSave: true,
    analytics: true,
    marketingEmails: false,
    reminders: true
  })

  // Update dark mode setting when theme changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      darkMode: isDark
    }))
  }, [isDark])

  const handleBack = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }

  const toggleSetting = (setting: string) => {
    triggerImpact(
      settings[setting as keyof typeof settings] 
        ? Haptics.ImpactFeedbackStyle.Light 
        : Haptics.ImpactFeedbackStyle.Medium
    )
    
    // Handle dark mode toggle specially
    if (setting === 'darkMode') {
      toggleColorScheme()
      // Setting will be updated via the useEffect
      return
    }
    
    setSettings(prev => ({ 
      ...prev, 
      [setting]: !prev[setting as keyof typeof settings] 
    }))
  }
  
  const handleSignOut = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // Add sign out logic here
            console.log('User signed out')
          },
        },
      ]
    )
  }
  
  const handleDeleteAccount = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Heavy)
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently removed. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Add account deletion logic here
            console.log('Account deleted')
          },
        },
      ]
    )
  }
  
  const handleResetSettings = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    setSettings({
      darkMode: false,
      notifications: true,
      soundEffects: true,
      hapticFeedback: true,
      dataSync: true,
      biometricAuth: false,
      autoSave: true,
      analytics: true,
      marketingEmails: false,
      reminders: true
    })
    
    // Reset theme as well
    if (isDark) {
      setColorScheme('light')
    }
  }
  
  const toggleExpand = (section: SettingCategory) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    setExpandedSection(expandedSection === section ? null : section)
  }
  
  // Define all settings sections
  const settingsSections: SettingsSection[] = [
    {
      title: 'Appearance',
      icon: 'eye',
      color: Colors.primary[500],
      key: 'appearance',
      options: [
        {
          key: 'darkMode',
          label: 'Dark Mode',
          icon: 'moon',
          description: 'Switch between light and dark themes',
          type: 'switch',
          value: settings.darkMode
        }
      ]
    },
    {
      title: 'Notifications',
      icon: 'bell',
      color: Colors.success[500],
      key: 'notifications',
      options: [
        {
          key: 'notifications',
          label: 'Enable Notifications',
          icon: 'bell',
          type: 'switch',
          value: settings.notifications
        },
        {
          key: 'reminders',
          label: 'Task Reminders',
          icon: 'clock',
          description: 'Receive reminders for upcoming tasks',
          type: 'switch',
          value: settings.reminders
        }
      ]
    },
    {
      title: 'Feedback',
      icon: 'zap',
      color: '#FFB300',
      key: 'feedback',
      options: [
        {
          key: 'soundEffects',
          label: 'Sound Effects',
          icon: 'volume-2',
          description: 'Play sounds for various actions',
          type: 'switch',
          value: settings.soundEffects
        },
        {
          key: 'hapticFeedback',
          label: 'Haptic Feedback',
          icon: 'smartphone',
          description: 'Vibration feedback for interactions',
          type: 'switch',
          value: settings.hapticFeedback
        }
      ]
    },
    {
      title: 'Account',
      icon: 'user',
      color: '#9C27B0',
      key: 'account',
      options: [
        {
          key: 'dataSync',
          label: 'Data Synchronization',
          icon: 'refresh-cw',
          description: 'Keep data synced across devices',
          type: 'switch',
          value: settings.dataSync
        },
        {
          key: 'biometricAuth',
          label: 'Biometric Authentication',
          icon: 'fingerprint',
          description: 'Use fingerprint or face ID to log in',
          type: 'switch',
          value: settings.biometricAuth
        },
        {
          key: 'signOut',
          label: 'Sign Out',
          icon: 'log-out',
          type: 'action',
          onPress: handleSignOut
        }
      ]
    },
    {
      title: 'Privacy',
      icon: 'shield',
      color: '#607D8B',
      key: 'privacy',
      options: [
        {
          key: 'analytics',
          label: 'Usage Analytics',
          icon: 'bar-chart-2',
          description: 'Send anonymous usage data',
          type: 'switch',
          value: settings.analytics
        },
        {
          key: 'marketingEmails',
          label: 'Marketing Emails',
          icon: 'mail',
          description: 'Receive promotional emails',
          type: 'switch',
          value: settings.marketingEmails
        },
        {
          key: 'deleteAccount',
          label: 'Delete Account',
          icon: 'trash-2',
          description: 'Permanently delete your account and all data',
          type: 'action',
          onPress: handleDeleteAccount
        }
      ]
    },
    {
      title: 'About',
      icon: 'info',
      color: '#2196F3',
      key: 'about',
      options: [
        {
          key: 'resetSettings',
          label: 'Reset Settings',
          icon: 'refresh-ccw',
          description: 'Restore default settings',
          type: 'action',
          onPress: handleResetSettings
        }
      ]
    }
  ]

  return (
    <AnimatedSafeAreaView 
      style={[
        styles.container, 
        { 
          backgroundColor: isDark ? colors.background.dark : colors.background.light,
          paddingTop: insets.top
        }
      ]} 
      entering={FadeIn}
    >
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={isDark ? colors.background.dark : colors.background.light} 
      />
      
      <Animated.View 
        style={[
          styles.header, 
          { 
            borderBottomColor: isDark ? colors.border : Colors.neutrals.gray200 
          }
        ]} 
        entering={SlideInRight.duration(300)}
      >
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather 
            name="arrow-left" 
            size={24} 
            color={isDark ? colors.text.primary : Colors.primary[500]} 
          />
        </TouchableOpacity>
        <Text 
          style={[
            styles.title,
            { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }
          ]}
        >
          Settings
        </Text>
      </Animated.View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map((section, sectionIndex) => (
          <Animated.View 
            key={section.key}
            entering={SlideInRight.delay(100 + (sectionIndex * 50)).duration(300)}
            style={[
              styles.sectionContainer,
              { 
                backgroundColor: isDark ? colors.card.background : Colors.neutrals.white,
                shadowColor: isDark ? colors.shadow : Colors.neutrals.black
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleExpand(section.key)}
              activeOpacity={0.8}
            >
              <View style={styles.sectionTitleContainer}>
                <View 
                  style={[
                    styles.sectionIconContainer,
                    { backgroundColor: section.color + '20' }
                  ]}
                >
                  <Feather name={section.icon} size={18} color={section.color} />
                </View>
                <Text 
                  style={[
                    styles.sectionTitle,
                    { color: isDark ? colors.text.primary : Colors.neutrals.gray800 }
                  ]}
                >
                  {section.title}
                </Text>
              </View>
              <Feather 
                name={expandedSection === section.key ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={isDark ? colors.text.secondary : Colors.neutrals.gray600} 
              />
            </TouchableOpacity>
            
            {(expandedSection === section.key || section.key === 'appearance') && (
              <Animated.View 
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
              >
                {section.options.map((option, index) => (
                  <View 
                    key={option.key}
                    style={[
                      styles.settingItem,
                      index === section.options.length - 1 && styles.settingItemLast
                    ]}
                  >
                    <View style={styles.settingLabelContainer}>
                      <Feather 
                        name={option.icon} 
                        size={18} 
                        color={
                          option.key === 'deleteAccount' ? Colors.error[500] :
                          isDark ? colors.text.secondary : Colors.neutrals.gray700
                        } 
                        style={styles.settingIcon}
                      />
                      <View>
                        <Text 
                          style={[
                            styles.settingLabel,
                            { 
                              color: option.key === 'deleteAccount' ? Colors.error[500] :
                              isDark ? colors.text.primary : Colors.neutrals.gray700 
                            }
                          ]}
                        >
                          {option.label}
                        </Text>
                        {option.description && (
                          <Text 
                            style={[
                              styles.settingDescription,
                              { color: isDark ? colors.text.secondary : Colors.neutrals.gray500 }
                            ]}
                          >
                            {option.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    {option.type === 'switch' ? (
                      <Switch
                        value={option.value as boolean}
                        onValueChange={() => toggleSetting(option.key)}
                        trackColor={{ 
                          false: isDark ? colors.border : Colors.neutrals.gray300, 
                          true: option.key === 'darkMode' ? (isDark ? '#5B5EF4' : Colors.primary[500]) : Colors.primary[500]
                        }}
                        thumbColor={Platform.OS === 'android' ? (
                          (option.value as boolean) ? Colors.neutrals.white : Colors.neutrals.white
                        ) : Colors.neutrals.white}
                        ios_backgroundColor={isDark ? colors.border : Colors.neutrals.gray300}
                      />
                    ) : option.type === 'action' ? (
                      <TouchableOpacity 
                        style={[
                          styles.actionButton,
                          option.key === 'deleteAccount' && styles.deleteButton
                        ]}
                        onPress={option.onPress}
                      >
                        <Text 
                          style={[
                            styles.actionButtonText,
                            option.key === 'deleteAccount' && styles.deleteButtonText
                          ]}
                        >
                          {option.key === 'deleteAccount' ? 'Delete' : 'Tap'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))}
              </Animated.View>
            )}
          </Animated.View>
        ))}

        <Animated.View 
          style={styles.appInfoContainer} 
          entering={SlideInRight.delay(600).duration(300)}
        >
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[Colors.primary[400], Colors.primary[700]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logo}
            >
              <Text style={styles.logoText}>TU</Text>
            </LinearGradient>
          </View>
          <Text 
            style={[
              styles.appName,
              { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }
            ]}
          >
            {AppInfo.appName}
          </Text>
          <Text 
            style={[
              styles.appVersion,
              { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }
            ]}
          >
            Version {AppInfo.appVersion}
          </Text>
          <Text 
            style={[
              styles.copyright,
              { color: isDark ? colors.text.secondary : Colors.neutrals.gray500 }
            ]}
          >
            {AppInfo.copyright}
          </Text>
        </Animated.View>
      </ScrollView>
    </AnimatedSafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: Spacing.sm
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
    flex: 1
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: Spacing.md
  },
  sectionContainer: {
    borderRadius: 16,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md
  },
  sectionTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutrals.gray200
  },
  settingItemLast: {
    borderBottomWidth: 0
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingIcon: {
    marginRight: Spacing.md
  },
  settingLabel: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium
  },
  settingDescription: {
    fontSize: Typography.sizes.bodySmall,
    marginTop: 2
  },
  actionButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    backgroundColor: Colors.primary[100]
  },
  actionButtonText: {
    color: Colors.primary[500],
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium
  },
  deleteButton: {
    backgroundColor: Colors.error[100]
  },
  deleteButtonText: {
    color: Colors.error[500]
  },
  appInfoContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.xl
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  logo: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoText: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white
  },
  appName: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.bold
  },
  appVersion: {
    fontSize: Typography.sizes.bodySmall,
    marginTop: Spacing.xs
  },
  copyright: {
    fontSize: Typography.sizes.caption,
    marginTop: Spacing.lg
  }
})

export default SettingsScreen