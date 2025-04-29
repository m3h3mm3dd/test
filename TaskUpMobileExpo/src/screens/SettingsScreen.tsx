import React, { useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, StatusBar, TouchableOpacity, Switch, ScrollView } from 'react-native'
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import AppInfo from '../constants/AppInfo'

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    soundEffects: true,
    hapticFeedback: true
  })

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }

  const toggleSetting = (setting) => {
    Haptics.impactAsync(
      settings[setting] 
        ? Haptics.ImpactFeedbackStyle.Light 
        : Haptics.ImpactFeedbackStyle.Medium
    )
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }))
  }

  return (
    <AnimatedSafeAreaView style={styles.container} entering={FadeIn}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
      
      <Animated.View style={styles.header} entering={SlideInRight.delay(100)}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </Animated.View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={SlideInRight.delay(200)}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={settings.darkMode}
              onValueChange={() => toggleSetting('darkMode')}
              trackColor={{ false: Colors.neutrals.gray300, true: Colors.primary.blue }}
              thumbColor={Colors.neutrals.white}
              ios_backgroundColor={Colors.neutrals.gray300}
            />
          </View>
        </Animated.View>

        <Animated.View entering={SlideInRight.delay(300)}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch
              value={settings.notifications}
              onValueChange={() => toggleSetting('notifications')}
              trackColor={{ false: Colors.neutrals.gray300, true: Colors.primary.blue }}
              thumbColor={Colors.neutrals.white}
              ios_backgroundColor={Colors.neutrals.gray300}
            />
          </View>
        </Animated.View>

        <Animated.View entering={SlideInRight.delay(400)}>
          <Text style={styles.sectionTitle}>Feedback</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Switch
              value={settings.soundEffects}
              onValueChange={() => toggleSetting('soundEffects')}
              trackColor={{ false: Colors.neutrals.gray300, true: Colors.primary.blue }}
              thumbColor={Colors.neutrals.white}
              ios_backgroundColor={Colors.neutrals.gray300}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <Switch
              value={settings.hapticFeedback}
              onValueChange={() => toggleSetting('hapticFeedback')}
              trackColor={{ false: Colors.neutrals.gray300, true: Colors.primary.blue }}
              thumbColor={Colors.neutrals.white}
              ios_backgroundColor={Colors.neutrals.gray300}
            />
          </View>
        </Animated.View>

        <Animated.View style={styles.appInfoContainer} entering={SlideInRight.delay(500)}>
          <Text style={styles.appName}>{AppInfo.appName}</Text>
          <Text style={styles.appVersion}>Version {AppInfo.appVersion}</Text>
          <Text style={styles.copyright}>{AppInfo.copyright}</Text>
        </Animated.View>
      </ScrollView>
    </AnimatedSafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    marginRight: Spacing.md
  },
  backButtonText: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium
  },
  title: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: Spacing.lg
  },
  sectionTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray800,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  settingLabel: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray700
  },
  appInfoContainer: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
    paddingVertical: Spacing.xl
  },
  appName: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900
  },
  appVersion: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginTop: Spacing.xs
  },
  copyright: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray500,
    marginTop: Spacing.lg
  }
})

export default SettingsScreen