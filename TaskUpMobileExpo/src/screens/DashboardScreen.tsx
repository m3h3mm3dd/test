import React, { useEffect, useState } from 'react'
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  Text,
  TouchableOpacity,
  Dimensions
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
  withTiming
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import Button from '../components/Button/Button'
import TaskDashboard from '../components/Dashboard/TaskDashboard'

const { width, height } = Dimensions.get('window')
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)

const DashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const scrollY = useSharedValue(0)
  const [tabIndex, setTabIndex] = useState(0)
  
  useEffect(() => {
    StatusBar.setBarStyle('light-content')
    
    return () => {
      StatusBar.setBarStyle('dark-content')
    }
  }, [])
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    }
  })
  
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
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>Alex Johnson</Text>
          </Animated.View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('NotificationsScreen')}
            >
              <Feather name="bell" size={22} color={Colors.neutrals.white} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('ProfileScreen')}
            >
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitials}>AJ</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      
      <Animated.View style={[styles.tabBar, tabBarAnimatedStyle]}>
        <AnimatedBlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.tabBarContent}>
          <TouchableOpacity 
            style={[styles.tabBarButton, tabIndex === 0 && styles.activeTabBarButton]}
            onPress={() => setTabIndex(0)}
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
            onPress={() => setTabIndex(1)}
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
            onPress={() => setTabIndex(2)}
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
      >
        <View style={styles.contentContainer}>
          <View style={styles.statsCards}>
            <Animated.View 
              style={styles.statsCardContainer}
              entering={FadeInDown.delay(200).duration(600)}
            >
              <TouchableOpacity style={[styles.statsCard, styles.tasksCard]}>
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
              <TouchableOpacity style={[styles.statsCard, styles.projectsCard]}>
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
              <TouchableOpacity style={[styles.statsCard, styles.teamsCard]}>
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
          </View>
          
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
                onPress={() => setTabIndex(0)}
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
                onPress={() => setTabIndex(0)}
                variant="primary"
                icon="grid"
                style={styles.emptyButton}
                animationType="bounce"
              />
            </Animated.View>
          )}
        </View>
      </Animated.ScrollView>
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
    zIndex: 20
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
    overflow: 'hidden'
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
  }
})

export default DashboardScreen