import React, { useEffect } from 'react'
import { StatusBar, LogBox } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'

import AppNavigator from './navigation/AppNavigator'
import Colors from './theme/Colors'

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
])

const App = () => {
  useEffect(() => {
    // App initialization effect
    const initApp = async () => {
      try {
        // Initialize haptics when app starts
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } catch (error) {
        console.log('Error initializing app:', error)
      }
    }

    initApp()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
      <AppNavigator />
    </GestureHandlerRootView>
  )
}

export default App