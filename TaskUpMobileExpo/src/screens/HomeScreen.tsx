import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  SlideInUp,
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import TaskDashboard from '../components/Dashboard/TaskDashboard';
import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import Spacing from '../theme/Spacing';
import { triggerImpact } from '../utils/HapticUtils';
import { useTheme } from '../hooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import FAB from '../components/FAB';

const { width, height } = Dimensions.get('window');
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  
  // Animation values
  const opacity = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const bgOpacity = useSharedValue(0);
  const fabScale = useSharedValue(0);
  
  useEffect(() => {
    // Sequence of animations for a smooth entry
    // 1. Background gradient fades in
    bgOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    
    // 2. Then header appears
    headerOpacity.value = withDelay(200, withTiming(1, { 
      duration: 500,
      easing: Easing.out(Easing.cubic)
    }));
    
    // 3. Main content fades in
    opacity.value = withDelay(300, withTiming(1, { 
      duration: 700,
      easing: Easing.out(Easing.cubic)
    }));
    
    // 4. Finally, FAB appears with a spring effect
    fabScale.value = withDelay(800, withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.back(2))
    }));
    
    // Set appropriate status bar style
    StatusBar.setStyle(isDark ? 'light' : 'dark');
  }, []);
  
  const screenStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
  }));
  
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      { translateY: withTiming(headerOpacity.value * 0, { 
        duration: 300,
        easing: Easing.out(Easing.cubic)
      })}
    ]
  }));
  
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value
  }));
  
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }]
  }));
  
  const handleQuickAction = (action: string) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    switch(action) {
      case 'search':
        navigation.navigate('Search');
        break;
      case 'notifications':
        navigation.navigate('Notifications');
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background.light }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Decorative background gradient */}
      <AnimatedGradient
        colors={isDark 
          ? [colors.background.dark, colors.primary[900] + '30', colors.background.dark] 
          : [colors.background.light, colors.primary[50] + '50', colors.background.light]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.backgroundGradient, backgroundStyle]}
      />
      
      {/* Custom Header */}
      <Animated.View 
        style={[
          styles.header,
          { paddingTop: insets.top + 10 },
          headerStyle
        ]}
        entering={SlideInUp.duration(500).delay(200)}
      >
        {Platform.OS === 'ios' && (
          <AnimatedBlurView
            intensity={isDark ? 20 : 50}
            tint={isDark ? 'dark' : 'light'}
            style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
          />
        )}
        <View style={styles.headerContent}>
          <View>
            <Animated.Text 
              style={[
                styles.greeting, 
                { color: isDark ? colors.text.primary : colors.neutrals.gray900 }
              ]}
              entering={FadeIn.duration(600).delay(300)}
            >
              Hello, Alex
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.date, 
                { color: isDark ? colors.text.secondary : colors.neutrals.gray600 }
              ]}
              entering={FadeIn.duration(600).delay(400)}
            >
              Tuesday, April 29, 2025
            </Animated.Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[
                styles.iconButton,
                { backgroundColor: isDark ? colors.neutrals[800] + '80' : colors.neutrals[100] + '80' }
              ]}
              onPress={() => handleQuickAction('search')}
            >
              <Feather 
                name="search" 
                size={20} 
                color={isDark ? colors.text.primary : colors.neutrals.gray700} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.iconButton,
                { backgroundColor: isDark ? colors.neutrals[800] + '80' : colors.neutrals[100] + '80' }
              ]}
              onPress={() => handleQuickAction('notifications')}
            >
              <Feather 
                name="bell" 
                size={20} 
                color={isDark ? colors.text.primary : colors.neutrals.gray700} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.iconButton,
                { backgroundColor: isDark ? colors.neutrals[800] + '80' : colors.neutrals[100] + '80' }
              ]}
              onPress={() => handleQuickAction('profile')}
            >
              <Feather 
                name="user" 
                size={20} 
                color={isDark ? colors.text.primary : colors.neutrals.gray700} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      
      {/* Main Content */}
      <Animated.View 
        style={[styles.content, screenStyle]}
        entering={FadeIn.duration(700).delay(300)}
      >
        <TaskDashboard 
          navigation={navigation} 
          initialFilter="upcoming"
        />
      </Animated.View>
      
      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, fabStyle]}>
        <FAB
          icon="plus"
          color={colors.primary[500]}
          onPress={() => {
            triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('TaskScreen', { isNew: true });
          }}
          shadow={true}
          size="medium"
          gradientColors={[colors.primary[400], colors.primary[600]]}
          animationType="bounce"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8
  },
  header: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        backgroundColor: 'transparent',
      },
      android: {
        backgroundColor: Colors.background.light + '90',
        elevation: 2,
      },
    }),
  },
  headerContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  date: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: Colors.neutrals[100] + '80',
  },
  content: {
    flex: 1,
    marginTop: -20, // Overlap with header for a more integrated look
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16 + (Platform.OS === 'ios' ? 24 : 16),
    right: 16,
  }
});

export default HomeScreen;