import React, { useEffect, useState, useCallback } from 'react'
import { 
  StyleSheet, 
  View, 
  StatusBar, 
  ScrollView, 
  Text,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Platform
} from 'react-native'
import Animated, { 
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
  FadeIn,
  FadeInDown,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  Layout
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useNavigation } from '@react-navigation/native'

// Import components
import Card from '../components/Card'
import FAB from '../components/FAB'
import SegmentedControl from '../components/Controls/SegmentedControl'
import TaskDashboard from '../components/Dashboard/TaskDashboard'
import SkeletonLoader from '../components/Skeleton/SkeletonLoader'
import Button from '../components/Button/Button'
import StatusPill from '../components/StatusPill'
import Avatar from '../components/Avatar/Avatar'

// Import themes and utilities
import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import { useTheme } from '../hooks/useColorScheme'
import { triggerImpact } from '../utils/HapticUtils'

const { width } = Dimensions.get('window')
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

// Tab options
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'tasks', label: 'My Tasks', icon: 'list' },
  { id: 'analytics', label: 'Analytics', icon: 'bar-chart-2' }
]

const DashboardScreen = () => {
  const { colors, isDark } = useTheme()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  
  const [activeTab, setActiveTab] = useState('dashboard')
  const [refreshing, setRefreshing] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState(3)
  
  // Animated values
  const scrollY = useSharedValue(0)
  const headerHeight = useSharedValue(200)
  const avatarScale = useSharedValue(1)
  const notificationBadgeScale = useSharedValue(1)
  const statCardOpacity = useSharedValue(0)
  const fabOpacity = useSharedValue(1)
  
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'light-content')
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent')
      StatusBar.setTranslucent(true)
    }
    
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
    if (notifications > 0) {
      notificationBadgeScale.value = withSequence(
        withDelay(800, withSpring(1.5, { damping: 10 })),
        withSpring(1, { damping: 15 })
      )
    }
    
    // Animate stat cards
    statCardOpacity.value = withTiming(1, { duration: 800 })
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
    
    return () => {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content')
    }
  }, [])
  
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    
    // Reset animations
    statCardOpacity.value = 0
    
    // Simulate refresh
    setTimeout(() => {
      triggerImpact(Haptics.ImpactFeedbackStyle.Light)
      setRefreshing(false)
      statCardOpacity.value = withTiming(1, { duration: 800 })
    }, 1500)
  }, [])
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
      
      // Hide/show FAB based on scroll direction
      const scrollingDown = event.contentOffset.y > 120
      fabOpacity.value = withTiming(scrollingDown ? 0 : 1, { duration: 200 })
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
  
  const navigateToAnalytics = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    navigation.navigate('AnalyticsScreen')
  }
  
  const handleTabChange = (tabId) => {
    if (activeTab === tabId) return
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    setActiveTab(tabId)
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
      opacity,
      transform: [
        { 
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [0, -10],
            Extrapolation.CLAMP
          )
        }
      ]
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
      height,
      shadowOpacity: interpolate(
        scrollY.value,
        [0, 100],
        [0, 0.2],
        Extrapolation.CLAMP
      )
    }
  })
  
  const gradientAnimatedStyle = useAnimatedStyle(() => {
    const colors = isDark 
      ? [colors.primary[900], colors.primary[700]]
      : [colors.primary[700], colors.primary[500]]
    
    return {
      colors
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
  
  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fabOpacity.value,
      transform: [
        { scale: fabOpacity.value },
        { 
          translateY: interpolate(
            fabOpacity.value,
            [0, 1],
            [20, 0],
            Extrapolation.CLAMP
          )
        }
      ]
    }
  })
  
  // Stats card data
  const statsCards = [
    {
      id: 'tasks',
      icon: 'check-square',
      value: 24,
      label: 'Tasks Done',
      gradientColors: isDark 
        ? [colors.primary[600], colors.primary[800]] 
        : [colors.primary[500], colors.primary[700]]
    },
    {
      id: 'projects',
      icon: 'briefcase',
      value: 7,
      label: 'Projects',
      gradientColors: isDark 
        ? ['#00796B', '#004D40'] 
        : [colors.secondary[500], '#009688']
    },
    {
      id: 'teams',
      icon: 'users',
      value: 4,
      label: 'Teams',
      gradientColors: isDark 
        ? ['#7B1FA2', '#4A148C'] 
        : ['#9C27B0', '#673AB7']
    }
  ]

  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDark ? colors.background.dark : colors.background.light }
    ]}>
      <Animated.View 
        style={[
          styles.header,
          { 
            paddingTop: insets.top,
            shadowColor: isDark ? colors.background.dark : colors.neutrals.black
          },
          headerAnimatedStyle
        ]}
      >
        <AnimatedLinearGradient
          colors={[colors.primary[700], colors.primary[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          animatedProps={gradientAnimatedStyle}
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
              activeOpacity={0.8}
            >
              <Feather name="bell" size={22} color={Colors.neutrals.white} />
              {notifications > 0 && (
                <Animated.View 
                  style={[styles.notificationBadge, notificationBadgeAnimatedStyle]} 
                >
                  {notifications > 1 && (
                    <Text style={styles.notificationCount}>{notifications}</Text>
                  )}
                </Animated.View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={navigateToProfile}
              activeOpacity={0.8}
            >
              <Animated.View style={avatarAnimatedStyle}>
                <Avatar 
                  name="Alex Johnson"
                  size={40}
                  status="online"
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      
      <Animated.View style={[styles.tabBar, tabBarAnimatedStyle]}>
        <AnimatedBlurView 
          intensity={isDark ? 60 : 80} 
          tint={isDark ? "dark" : "light"} 
          style={StyleSheet.absoluteFill} 
        />
        <View style={styles.tabBarContent}>
          <SegmentedControl
            segments={TABS.map(tab => ({ id: tab.id, label: tab.label }))}
            selectedId={activeTab}
            onChange={handleTabChange}
            style={styles.segmentedControl}
          />
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
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        <View style={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 40 }
        ]}>
          {isLoading ? (
            // Show skeleton loaders
            <Animated.View style={[styles.statsCards, statCardsAnimatedStyle]}>
              {[1, 2, 3].map(index => (
                <View key={index} style={styles.statsCardContainer}>
                  <SkeletonLoader.Card style={styles.statsCardSkeleton} />
                </View>
              ))}
            </Animated.View>
          ) : (
            <Animated.View style={[styles.statsCards, statCardsAnimatedStyle]}>
              {statsCards.map((stat, index) => (
                <Animated.View 
                  key={stat.id}
                  style={styles.statsCardContainer}
                  entering={FadeInDown.delay(200 + index * 100).duration(600)}
                >
                  <Card 
                    style={styles.statsCard}
                    onPress={() => {
                      triggerImpact(Haptics.ImpactFeedbackStyle.Light)
                      if (stat.id === 'tasks') handleTabChange('tasks')
                      if (stat.id === 'projects') navigation.navigate('ProjectScreen')
                      if (stat.id === 'teams') handleTabChange('dashboard')
                    }}
                    elevation={isDark ? 4 : 6}
                    gradientColors={stat.gradientColors}
                    animationType="spring"
                  >
                    <View style={styles.statsIconContainer}>
                      <Feather name={stat.icon} size={24} color={Colors.neutrals.white} />
                    </View>
                    <Text style={styles.statsValue}>{stat.value}</Text>
                    <Text style={styles.statsLabel}>{stat.label}</Text>
                    
                    <View style={styles.statsCardIndicator} />
                  </Card>
                </Animated.View>
              ))}
            </Animated.View>
          )}
          
          {activeTab === 'dashboard' && (
            <Animated.View 
              entering={FadeIn.duration(500)}
              layout={Layout.springify().damping(14)}
            >
              <TaskDashboard navigation={navigation} />
            </Animated.View>
          )}
          
          {activeTab === 'tasks' && (
            <Animated.View 
              entering={FadeIn.duration(500)}
              style={styles.emptyView}
              layout={Layout.springify().damping(14)}
            >
              <Feather 
                name="list" 
                size={60} 
                color={isDark ? colors.neutrals[700] : Colors.neutrals[300]} 
              />
              <Text style={[
                styles.emptyTitle,
                { color: isDark ? colors.text.primary : Colors.neutrals[800] }
              ]}>
                My Tasks
              </Text>
              <Text style={[
                styles.emptyText,
                { color: isDark ? colors.text.secondary : Colors.neutrals[600] }
              ]}>
                This section will show your assigned tasks and upcoming deadlines
              </Text>
              
              <StatusPill
                label="Coming Soon"
                type="info"
                icon="clock"
                style={styles.comingSoonPill}
              />
              
              <Button 
                title="View Task Dashboard"
                onPress={() => handleTabChange('dashboard')}
                variant="primary"
                icon="grid"
                style={styles.emptyButton}
                animationType="bounce"
              />
            </Animated.View>
          )}
          
          {activeTab === 'analytics' && (
            <Animated.View 
              entering={FadeIn.duration(500)}
              style={styles.emptyView}
              layout={Layout.springify().damping(14)}
            >
              <Feather 
                name="bar-chart-2" 
                size={60} 
                color={isDark ? colors.neutrals[700] : Colors.neutrals[300]} 
              />
              <Text style={[
                styles.emptyTitle,
                { color: isDark ? colors.text.primary : Colors.neutrals[800] }
              ]}>
                Analytics
              </Text>
              <Text style={[
                styles.emptyText,
                { color: isDark ? colors.text.secondary : Colors.neutrals[600] }
              ]}>
                Track your team's productivity and project progress
              </Text>
              
              <StatusPill
                label="New Feature"
                type="success"
                icon="zap"
                style={styles.comingSoonPill}
              />
              
              <Button 
                title="View Analytics"
                onPress={navigateToAnalytics}
                variant="primary"
                icon="bar-chart-2"
                style={styles.emptyButton}
                animationType="bounce"
              />
            </Animated.View>
          )}
        </View>
      </Animated.ScrollView>
      
      {/* Floating Action Button */}
      <Animated.View style={fabAnimatedStyle}>
        <FAB
          icon="plus"
          onPress={() => {
            triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
          }}
          gradientColors={[colors.primary[500], colors.primary[700]]}
          style={styles.fab}
          animationType="bounce"
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    height: 200,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12
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
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginTop: Spacing.xs
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md
  },
  notificationBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error[500],
    position: 'absolute',
    top: -4,
    right: -4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.neutrals.white
  },
  notificationCount: {
    fontSize: 8,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden'
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs
  },
  segmentedControl: {
    width: '100%'
  },
  scrollView: {
    flex: 1,
    marginTop: 120
  },
  contentContainer: {
    paddingTop: 80
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
    height: 120,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 16
  },
  statsCardSkeleton: {
    height: 120,
    borderRadius: 16
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
  statsCardIndicator: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 6,
    height: 20,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
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
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm
  },
  emptyText: {
    fontSize: Typography.sizes.body,
    textAlign: 'center',
    marginBottom: Spacing.xl
  },
  comingSoonPill: {
    marginBottom: Spacing.lg
  },
  emptyButton: {
    marginTop: Spacing.md
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20
  }
})

export default DashboardScreen