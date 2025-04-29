import React, { useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  StatusBar, 
  Dimensions 
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'

const { width, height } = Dimensions.get('window')

const SplashScreen = () => {
  // Animation values
  const logoScale = useSharedValue(0.5)
  const logoOpacity = useSharedValue(0)
  const logoRotation = useSharedValue(0)
  const textOpacity = useSharedValue(0)
  const progress = useSharedValue(0)
  
  // Start animations when component mounts
  useEffect(() => {
    // Logo animation sequence
    logoOpacity.value = withTiming(1, { duration: 800 })
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 800, easing: Easing.out(Easing.back()) }),
      withTiming(1, { duration: 400 })
    )
    logoRotation.value = withSequence(
      withTiming(360, { duration: 800 }),
      withDelay(400, withTiming(720, { duration: 800 }))
    )
    
    // Text fade in
    textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }))
    
    // Progress animation
    progress.value = withTiming(1, { duration: 2000 })
  }, [])
  
  // Animated styles
  const logoContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [
        { scale: logoScale.value },
        { rotate: `${logoRotation.value}deg` }
      ]
    }
  })
  
  const textContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [
        { translateY: withTiming(textOpacity.value * 20, { duration: 800 }) }
      ]
    }
  })
  
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`
    }
  })
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.blue} />
      
      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.primary.darkBlue, Colors.primary.blue]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
          <View style={styles.logoCircle}>
            <Feather name="check-square" size={60} color="#fff" />
          </View>
        </Animated.View>
        
        {/* App Name */}
        <Animated.View style={[styles.textContainer, textContainerStyle]}>
          <Text style={styles.appName}>TaskUp</Text>
          <Text style={styles.tagline}>Manage tasks with ease</Text>
        </Animated.View>
        
        {/* Loading indicator */}
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>
      </View>
      
      {/* Version */}
      <Animated.Text 
        style={[styles.versionText, { opacity: textOpacity }]}
      >
        Version 1.0.0
      </Animated.Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentContainer: {
    alignItems: 'center'
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center'
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60
  },
  appName: {
    fontSize: 40,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginBottom: 8
  },
  tagline: {
    fontSize: Typography.sizes.body,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  progressContainer: {
    width: width * 0.5,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 2
  },
  versionText: {
    position: 'absolute',
    bottom: 40,
    fontSize: Typography.sizes.caption,
    color: 'rgba(255, 255, 255, 0.5)'
  }
})

export default SplashScreen