import React, { useEffect, useState, useRef } from 'react'
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  Text,
  TouchableOpacity,
  Dimensions,
  RefreshControl
} from 'react-native'
import Animated, { 
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeInRight,
  withTiming,
  withSequence,
  withSpring
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import Button from '../components/Button/Button'
import TaskDashboard from '../components/Dashboard/TaskDashboard'
import { triggerImpact } from '../utils/HapticUtils'

const { width, height } = Dimensions.get('window')
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)

const DashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const scrollY = useSharedValue(0)
  const [tabIndex, setTabIndex] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [greeting, setGreeting] = useState('')
  
  // Animation values
  const headerHeight = useSharedValue(200)
  const avatarScale = useSharedValue(1)
  const notificationBadgeScale = useSharedValue(1)
  const statCardOpacity = useSharedValue(0)
  
  useEffect(() => {
    StatusBar.setBarStyle('light-content')
    
    // Set greeting based on time of day
    const hours = new Date().getHours()
    let greetingText = ''
    
    if (hours < 12) {
      greetingText = 'Good morning,'
    } else if (hours < 18) {
      greetingText = 'Good afternoon,'
    } else {
      greetingText = 'Good evening,'
    }
    
    setGreeting(greetingText)
    
    // Animate notification badge
    notificationBadgeScale.value = withSequence(
      withDelay(1000, withSpring(1.5, { damping: 10 })),
      withSpring(1, { damping: 15 })
    )
    
    // Animate stat cards
    statCardOpacity.value = withTiming(1, { duration: 800 })
    
    return () => {
      StatusBar.setBarStyle('dark-content')
    }
  }, [])
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    
    // Simulate refresh
    setTimeout(() => {
      triggerImpact(Haptics.ImpactFeedbackStyle.Light)
      setRefreshing(false)
    }, 1500)
  }, [])
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    }
  })
  
  const navigateToNotifications = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    navigation.navigate('NotificationsScreen')
  }
  
  const navigateToProfile = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    navigation.navigate('ProfileScreen')
  }
  
  const handleTabPress = (index) => {
    if (tabIndex === index) return
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    setTabIndex(index)
  }
  
  // Animated styles
  const tabBarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50],
      [0, 1],
      Extrapolation.CLAMP
    )
    
    return {
      opacity
    }
  })
  
  const contentOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0],
      Extrapolation.CLAMP
    )
    
    return {
      opacity
    }
  })
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 100],
      [200, 120],
      Extrapolation.CLAMP
    )
    
    return {
      height
    }
  })
  
  const avatarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: avatarScale.value }]
    }
  })
  
  const notificationBadgeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: notificationBadgeScale.value }]
    }
  })
  
  const statCardsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: statCardOpacity.value,
      transform: [
        { 
          translateY: interpolate(
            statCardOpacity.value,
            [0, 1],
            [20, 0],
            Extrapolation.CLAMP
          )
        }
      ]
    }
  })

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.header,
          { paddingTop: insets.top },
          headerAnimatedStyle
        ]}
      >
        <LinearGradient
          colors={[Colors.primary.darkBlue, Colors.primary.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.headerContent}>
          <Animated.View style={[styles.titleContainer, contentOpacity]}>
            <Text style={styles.welcomeText}>{greeting}</Text>
            <Text style={styles.nameText}>Alex Johnson</Text>
          </Animated.View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={navigateToNotifications}
            >
              <Feather name="bell" size={22} color={Colors.neutrals.white} />
              <Animated.View 
                style={[styles.notificationBadge, notificationBadgeAnimatedStyle]} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={navigateToProfile}
            >
              <Animated.View 
                style={[styles.profileAvatar, avatarAnimatedStyle]}
              >
                <Text style={styles.profileInitials}>AJ</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      
      <Animated.View style={[styles.tabBar, tabBarAnimatedStyle]}>
        <AnimatedBlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.tabBarContent}>
          <TouchableOpacity 
            style={[styles.tabBarButton, tabIndex === 0 && styles.activeTabBarButton]}
            onPress={() => handleTabPress(0)}
          >
            <Feather 
              name="grid" 
              size={20} 
              color={tabIndex === 0 ? Colors.primary.blue : Colors.neutrals.gray600} 
            />
            <Text 
              style={[
                styles.tabBarText, 
                tabIndex === 0 && styles.activeTabBarText
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabBarButton, tabIndex === 1 && styles.activeTabBarButton]}
            onPress={() => handleTabPress(1)}
          >
            <Feather 
              name="list" 
              size={20} 
              color={tabIndex === 1 ? Colors.primary.blue : Colors.neutrals.gray600} 
            />
            <Text 
              style={[
                styles.tabBarText, 
                tabIndex === 1 && styles.activeTabBarText
              ]}
            >
              My Tasks
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabBarButton, tabIndex === 2 && styles.activeTabBarButton]}
            onPress={() => handleTabPress(2)}
          >
            <Feather 
              name="bar-chart-2" 
              size={20} 
              color={tabIndex === 2 ? Colors.primary.blue : Colors.neutrals.gray600} 
            />
            <Text 
              style={[
                styles.tabBarText, 
                tabIndex === 2 && styles.activeTabBarText
              ]}
            >
              Analytics
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.primary.blue}
            colors={[Colors.primary.blue]}
          />
        }
      >
        <View style={styles.contentContainer}>
          <Animated.View 
            style={[styles.statsCards, statCardsAnimatedStyle]}
          >
            <Animated.View 
              style={styles.statsCardContainer}
              entering={FadeInDown.delay(200).duration(600)}
            >
              <TouchableOpacity 
                style={[styles.statsCard, styles.tasksCard]}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[Colors.primary.blue, Colors.primary.darkBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, styles.statsCardGradient]}
                />
                <View style={styles.statsIconContainer}>
                  <Feather name="check-square" size={24} color={Colors.neutrals.white} />
                </View>
                <Text style={styles.statsValue}>24</Text>
                <Text style={styles.statsLabel}>Tasks Done</Text>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View 
              style={styles.statsCardContainer}
              entering={FadeInDown.delay(300).duration(600)}
            >
              <TouchableOpacity 
                style={[styles.statsCard, styles.projectsCard]}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[Colors.secondary.green, '#009688']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, styles.statsCardGradient]}
                />
                <View style={styles.statsIconContainer}>
                  <Feather name="folder" size={24} color={Colors.neutrals.white} />
                </View>
                <Text style={styles.statsValue}>7</Text>
                <Text style={styles.statsLabel}>Projects</Text>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View 
              style={styles.statsCardContainer}
              entering={FadeInDown.delay(400).duration(600)}
            >
              <TouchableOpacity 
                style={[styles.statsCard, styles.teamsCard]}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#9C27B0', '#673AB7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, styles.statsCardGradient]}
                />
                <View style={styles.statsIconContainer}>
                  <Feather name="users" size={24} color={Colors.neutrals.white} />
                </View>
                <Text style={styles.statsValue}>4</Text>
                <Text style={styles.statsLabel}>Teams</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
          
          {tabIndex === 0 && (
            <Animated.View entering={FadeIn.duration(500)}>
              <TaskDashboard navigation={navigation} />
            </Animated.View>
          )}
          
          {tabIndex === 1 && (
            <Animated.View entering={FadeIn.duration(500)} style={styles.emptyView}>
              <Feather name="list" size={60} color={Colors.neutrals.gray300} />
              <Text style={styles.emptyTitle}>My Tasks</Text>
              <Text style={styles.emptyText}>
                This section is under construction. Check back soon!
              </Text>
              <Button 
                title="View Task Dashboard"
                onPress={() => handleTabPress(0)}
                variant="primary"
                icon="grid"
                style={styles.emptyButton}
                animationType="bounce"
              />
            </Animated.View>
          )}
          
          {tabIndex === 2 && (
            <Animated.View entering={FadeIn.duration(500)} style={styles.emptyView}>
              <Feather name="bar-chart-2" size={60} color={Colors.neutrals.gray300} />
              <Text style={styles.emptyTitle}>Analytics</Text>
              <Text style={styles.emptyText}>
                This section is under construction. Check back soon!
              </Text>
              <Button 
                title="View Task Dashboard"
                onPress={() => handleTabPress(0)}
                variant="primary"
                icon="grid"
                style={styles.emptyButton}
                animationType="bounce"
              />
            </Animated.View>
          )}
          
          {/* Bottom padding for scroll content */}
          <View style={{ height: 80 }} />
        </View>
      </Animated.ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
        }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[Colors.primary.blue, Colors.primary.darkBlue]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          borderRadius={28}
        />
        <Feather name="plus" size={24} color={Colors.neutrals.white} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    height: 200,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden'
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    justifyContent: 'space-between'
  },
  titleContainer: {
    marginTop: Spacing.lg
  },
  welcomeText: {
    fontSize: Typography.sizes.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  nameText: {
    fontSize: Typography.sizes.header,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md
  },
  notificationBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary.red,
    position: 'absolute',
    top: 10,
    right: 10
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden'
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileInitials: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white
  },
  tabBar: {
    position: 'absolute',
    top: 120,
    left: Spacing.lg,
    right: Spacing.lg,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8
  },
  tabBarContent: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md
  },
  tabBarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginHorizontal: 4
  },
  activeTabBarButton: {
    backgroundColor: 'rgba(61, 90, 254, 0.1)'
  },
  tabBarText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray600,
    marginLeft: 6
  },
  activeTabBarText: {
    color: Colors.primary.blue
  },
  scrollView: {
    flex: 1,
    marginTop: 120
  },
  contentContainer: {
    paddingTop: 80,
    paddingBottom: 40
  },
  statsCards: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl
  },
  statsCardContainer: {
    flex: 1,
    paddingHorizontal: 4
  },
  statsCard: {
    borderRadius: 16,
    height: 120,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  },
  statsCardGradient: {
    borderRadius: 16
  },
  tasksCard: {
    backgroundColor: Colors.primary.blue
  },
  projectsCard: {
    backgroundColor: Colors.secondary.green
  },
  teamsCard: {
    backgroundColor: '#9C27B0'
  },
  statsIconContainer: {
    marginBottom: Spacing.sm
  },
  statsValue: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white
  },
  statsLabel: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl * 2
  },
  emptyTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray800,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm
  },
  emptyText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray600,
    textAlign: 'center',
    marginBottom: Spacing.xl
  },
  emptyButton: {
    marginTop: Spacing.lg
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  }
})

export default DashboardScreen