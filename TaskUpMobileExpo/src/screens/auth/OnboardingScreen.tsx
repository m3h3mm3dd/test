import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import Spacing from '../../theme/Spacing';
import Button from '../../components/Button/Button';
import { triggerImpact } from '../../utils/HapticUtils';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation();
  
  // Setup status bar
  StatusBar.setBarStyle('light-content');
  
  const handleLogin = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('LoginScreen');
  };
  
  const handleRegister = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('SignUpStep1');
  };
  
  return (
    <LinearGradient
      colors={[Colors.primary[700], Colors.primary[500]]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Feather name="check-square" size={60} color="#fff" />
            </View>
            <Text style={styles.appName}>TaskUp</Text>
          </View>
          
          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to TaskUp</Text>
            <Text style={styles.welcomeSubtitle}>
              Your ultimate task management solution to organize, track, and accomplish your goals.
            </Text>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Sign In"
              onPress={handleLogin}
              style={styles.signInButton}
              variant="secondary"
              fullWidth
              icon="log-in"
              iconPosition="right"
            />
            
            <Button
              title="Create Account"
              onPress={handleRegister}
              style={styles.registerButton}
              variant="primary"
              fullWidth
              icon="user-plus"
              iconPosition="right"
              gradientColors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
            />
            
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => navigation.navigate('DashboardScreen')}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Decorative Elements */}
        <View style={styles.decorationCircle1} />
        <View style={styles.decorationCircle2} />
        <View style={styles.decorationCircle3} />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingTop: Spacing.xl * 2,
    paddingBottom: Spacing.xl * 1.5,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  appName: {
    fontSize: 36,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginTop: Spacing.md,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl * 2,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: Typography.sizes.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  buttonContainer: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  signInButton: {
    marginBottom: Spacing.lg,
    backgroundColor: 'transparent',
    borderColor: Colors.neutrals.white,
    borderWidth: 1,
  },
  registerButton: {
    marginBottom: Spacing.xl,
  },
  skipButton: {
    alignSelf: 'center',
    padding: Spacing.md,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: Typography.sizes.body,
  },
  // Decorative elements
  decorationCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -50,
    right: -70
  },
  decorationCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: 100,
    left: -70
  },
  decorationCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: 150,
    right: -20
  }
});

export default OnboardingScreen;