import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StatusBar, 
  Dimensions,
  RefreshControl,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  withSpring,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideInUp,
  ZoomIn,
  interpolate,
  Extrapolation,
  Easing
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import { triggerImpact } from '../utils/HapticUtils'
import { useTheme } from '../hooks/useColorScheme'
import SwipeableRow from '../components/SwipeableRow'

const { width, height } = Dimensions.get('window')
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

interface Notification {
  id: string
  type: 'mention' | 'task' | 'comment' | 'project' | 'team' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  source: {
    id: string
    name: string
    avatar?: string
  }
  action?: {
    type: 'navigate' | 'open' | 'download'
    destination?: string
    data?: any
  }
}

const NotificationsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedTab, setSelectedTab] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // Refs
  const flatListRef = useRef<FlatList>(null)
  
  // Animated values
  const headerHeight = useSharedValue(120)
  const headerBgOpacity = useSharedValue(0)
  const filterHeight = useSharedValue(0)
  const filterOpacity = useSharedValue(0)
  const scrollY = useSharedValue(0)
  const notificationItemScale = useSharedValue(1)
  const emptyAnimationProgress = useSharedValue(0)
  const fabOpacity = useSharedValue(1)
  
  // Tabs for filtering
  const tabs = [
    { id: 'all', label: 'All', icon: 'inbox' },
    { id: 'unread', label: 'Unread', icon: 'alert-circle' },
    { id: 'mentions', label: 'Mentions', icon: 'at-sign' },
    { id: 'tasks', label: 'Tasks', icon: 'check-square' }
  ]
  
  // Load notifications data
  useEffect(() => {
    loadNotifications()
  }, [])

  // Load the mock notifications
  const loadNotifications = () => {
    // Simulate data loading
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'mention',
        title: 'Alex mentioned you',
        message: 'Hey @you, can you review the latest design updates?',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false,
        source: {
          id: 'user456',
          name: 'Alex Taylor'
        },
        action: {
          type: 'navigate',
          destination: 'ChatScreen',
          data: { chatId: 'chat123', chatName: 'Design Team' }
        }
      },
      {
        id: '2',
        type: 'task',
        title: 'Task assigned to you',
        message: 'Dashboard redesign - Morgan assigned a new task to you',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        source: {
          id: 'user789',
          name: 'Morgan Smith'
        },
        action: {
          type: 'navigate',
          destination: 'TaskDetails',
          data: { taskId: 'task456' }
        }
      },
      {
        id: '3',
        type: 'comment',
        title: 'New comment on your task',
        message: 'Jamie left a comment on "User onboarding flow"',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false,
        source: {
          id: 'user101',
          name: 'Jamie Parker'
        },
        action: {
          type: 'navigate',
          destination: 'TaskDetails',
          data: { taskId: 'task789', commentId: 'comment123' }
        }
      },
      {
        id: '4',
        type: 'project',
        title: 'Project status update',
        message: 'Mobile App Redesign is now 70% complete',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        source: {
          id: 'system',
          name: 'System'
        },
        action: {
          type: 'navigate',
          destination: 'ProjectDetails',
          data: { projectId: 'proj123' }
        }
      },
      {
        id: '5',
        type: 'team',
        title: 'New team member',
        message: 'Taylor Reed joined the Design Team',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        read: true,
        source: {
          id: 'system',
          name: 'System'
        },
        action: {
          type: 'navigate',
          destination: 'TeamDetails',
          data: { teamId: 'team456', memberId: 'user102' }
        }
      },
      {
        id: '6',
        type: 'task',
        title: 'Task due reminder',
        message: 'API Integration is due tomorrow',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        read: true,
        source: {
          id: 'system',
          name: 'System'
        },
        action: {
          type: 'navigate',
          destination: 'TaskDetails',
          data: { taskId: 'task101' }
        }
      },
      {
        id: '7',
        type: 'system',
        title: 'System maintenance',
        message: 'TaskUp will be undergoing maintenance this weekend',
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        read: true,
        source: {
          id: 'system',
          name: 'System'
        }
      }
    ]
    
    setNotifications(mockNotifications)
    
    // Calculate unread count
    const unread = mockNotifications.filter(n => !n.read).length
    setUnreadCount(unread)
    
    // Animate empty state if no notifications
    if (mockNotifications.length === 0) {
      emptyAnimationProgress.value = withDelay(
        500,
        withTiming(1, { duration: 800 })
      )
    }
  }
  
  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    
    // Simulate refreshing data
    setTimeout(() => {
      // Reload notifications
      loadNotifications()
      setRefreshing(false)
      triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    }, 1500)
  }, [])
  
  // Load more notifications
  const handleLoadMore = () => {
    if (loadingMore) return
    
    setLoadingMore(true)
    
    // Simulate loading more data
    setTimeout(() => {
      setLoadingMore(false)
    }, 1500)
  }
  
  // Filter notifications based on selected tab
  const getFilteredNotifications = useCallback(() => {
    switch (selectedTab) {
      case 'unread':
        return notifications.filter(n => !n.read)
      case 'mentions':
        return notifications.filter(n => n.type === 'mention')
      case 'tasks':
        return notifications.filter(n => n.type === 'task')
      default:
        return notifications
    }
  }, [selectedTab, notifications])
  
  const handleBackPress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }
  
  const handleNotificationPress = (notification: Notification) => {
    // Animate notification item
    notificationItemScale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withSpring(1, { damping: 14, stiffness: 150 })
    )
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    // Mark as read if unread
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    // Handle navigation action if available
    if (notification.action?.type === 'navigate' && notification.action.destination) {
      navigation.navigate(notification.action.destination, notification.action.data)
    }
  }
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id 
          ? { ...n, read: true } 
          : n
      )
    )
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1))
  }
  
  const markAllAsRead = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    
    // Animate the action
    const animateItems = async () => {
      // Get only unread notifications
      const unreadNotifications = notifications.filter(n => !n.read)
      
      // Mark all as read with a staggered animation
      for (let i = 0; i < unreadNotifications.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100))
        markAsRead(unreadNotifications[i].id)
      }
    }
    
    animateItems()
  }
  
  const deleteNotification = (id: string) => {
    // Check if it was unread before removing
    const wasUnread = notifications.find(n => n.id === id)?.read === false
    
    // Animate the removal with a scale effect
    notificationItemScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(0, { duration: 200 })
    )
    
    // Remove notification after animation
    setTimeout(() => {
      setNotifications(prev => 
        prev.filter(n => n.id !== id)
      )
      
      // Update unread count if needed
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      
      // Update empty animation if this was the last notification
      if (notifications.length === 1) {
        emptyAnimationProgress.value = withDelay(
          200,
          withTiming(1, { duration: 800 })
        )
      }
    }, 300)
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
  }
  
  const toggleFilter = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    setIsFilterOpen(prev => !prev)
    
    if (!isFilterOpen) {
      // Open filter
      filterHeight.value = withTiming(60, { 
        duration: 300,
        easing: Easing.out(Easing.exp)
      })
      filterOpacity.value = withTiming(1, { duration: 300 })
    } else {
      // Close filter
      filterHeight.value = withTiming(0, { 
        duration: 300,
        easing: Easing.out(Easing.exp)
      })
      filterOpacity.value = withTiming(0, { duration: 300 })
    }
  }
  
  const selectTab = (tabId: string) => {
    if (tabId === selectedTab) return
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    setSelectedTab(tabId)
    
    // Scroll to top when changing tabs
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true })
    }
  }
  
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y
    scrollY.value = offsetY
    
    // Adjust header background opacity and height based on scroll
    if (offsetY > 10) {
      headerHeight.value = withTiming(80, { 
        duration: 200,
        easing: Easing.out(Easing.cubic)
      })
      headerBgOpacity.value = withTiming(1, { 
        duration: 200, 
        easing: Easing.out(Easing.cubic)
      })
    } else {
      headerHeight.value = withTiming(120, { 
        duration: 300,
        easing: Easing.out(Easing.cubic)
      })
      headerBgOpacity.value = withTiming(0, { 
        duration: 300,
        easing: Easing.out(Easing.cubic)
      })
    }
    
    // Show/hide FAB based on scroll direction
    const lastContentOffset = { value: 0 }
    if (lastContentOffset.value > offsetY) {
      // Scrolling up, show FAB
      fabOpacity.value = withTiming(1, { duration: 200 })
    } else if (lastContentOffset.value < offsetY && offsetY > 50) {
      // Scrolling down and not at top, hide FAB
      fabOpacity.value = withTiming(0, { duration: 200 })
    }
    lastContentOffset.value = offsetY
  }
  
  // Format time from ISO string
  const formatNotificationTime = (isoString) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const diffInDays = diffInHours / 24
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }
  
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return 'at-sign'
      case 'task':
        return 'check-square'
      case 'comment':
        return 'message-circle'
      case 'project':
        return 'briefcase'
      case 'team':
        return 'users'
      default:
        return 'bell'
    }
  }
  
  // Animated styling
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      paddingTop: insets.top
    }
  })
  
  const headerBgAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerBgOpacity.value
    }
  })
  
  const titleAnimatedStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(
      headerHeight.value,
      [80, 120],
      [Typography.sizes.bodyLarge, Typography.sizes.title],
      Extrapolation.CLAMP
    )
    
    return {
      fontSize,
      transform: [
        { 
          translateY: interpolate(
            headerHeight.value,
            [80, 120],
            [-6, 0],
            Extrapolation.CLAMP
          )
        }
      ]
    }
  })
  
  const filterAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: filterHeight.value,
      opacity: filterOpacity.value
    }
  })
  
  const notificationItemAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: notificationItemScale.value }]
    }
  })
  
  const emptyStateAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: emptyAnimationProgress.value,
      transform: [
        { scale: interpolate(
          emptyAnimationProgress.value,
          [0, 1],
          [0.8, 1],
          Extrapolation.CLAMP
        )}
      ]
    }
  })
  
  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fabOpacity.value,
      transform: [
        { 
          translateY: interpolate(
            fabOpacity.value,
            [0, 1],
            [20, 0],
            Extrapolation.CLAMP
          ) 
        },
        { scale: fabOpacity.value }
      ]
    }
  })
  
  const renderLeftActions = (notification: Notification) => [
    {
      icon: 'check',
      label: 'Read',
      color: Colors.success[500],
      onPress: () => markAsRead(notification.id)
    }
  ]
  
  const renderRightActions = (notification: Notification) => [
    {
      icon: 'trash-2',
      label: 'Delete',
      color: Colors.error[500],
      onPress: () => deleteNotification(notification.id),
      destructive: true
    }
  ]
  
  const renderNotification = ({ item, index }) => {
    return (
      <Animated.View 
        entering={SlideInRight.delay(index * 50).duration(300).springify().damping(12)}
        style={notificationItemAnimatedStyle}
      >
        <SwipeableRow
          leftActions={!item.read ? renderLeftActions(item) : []}
          rightActions={renderRightActions(item)}
        >
          <TouchableOpacity
            style={[
              styles.notificationItem,
              !item.read && styles.unreadNotification,
              { backgroundColor: isDark ? colors.card.background : Colors.neutrals.white }
            ]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.8}
          >
            <View style={[
              styles.notificationIcon,
              { backgroundColor: getIconBackgroundColor(item.type) }
            ]}>
              <Feather 
                name={getNotificationIcon(item.type)} 
                size={16} 
                color={Colors.neutrals.white} 
              />
            </View>
            
            <View style={styles.notificationContent}>
              <Text 
                style={[
                  styles.notificationTitle,
                  !item.read && styles.unreadText,
                  { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              
              <Text 
                style={[
                  styles.notificationMessage,
                  { color: isDark ? colors.text.secondary : Colors.neutrals.gray700 }
                ]}
                numberOfLines={2}
              >
                {item.message}
              </Text>
              
              <Text style={[
                styles.notificationTime,
                { color: isDark ? colors.text.secondary : Colors.neutrals.gray500 }
              ]}>
                {formatNotificationTime(item.timestamp)}
              </Text>
            </View>
            
            {!item.read && (
              <View style={[
                styles.unreadDot,
                { backgroundColor: colors.primary[500] }
              ]} />
            )}
          </TouchableOpacity>
        </SwipeableRow>
      </Animated.View>
    )
  }
  
  // Get background color for notification icon
  const getIconBackgroundColor = (type: string) => {
    switch (type) {
      case 'mention':
        return colors.primary.blue
      case 'task':
        return colors.success[500]
      case 'comment':
        return colors.secondary[500]
      case 'project':
        return colors.warning[500]
      case 'team':
        return colors.primary[700]
      default:
        return colors.neutrals.gray600
    }
  }
  
  // Get filtered notifications based on selected tab
  const filteredNotifications = getFilteredNotifications()
  
  // Render header
  const renderHeader = () => (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      {/* Blurred background that appears when scrolling */}
      <AnimatedBlurView
        intensity={Platform.OS === 'ios' ? 40 : 0}
        tint={isDark ? 'dark' : 'light'}
        style={[
          StyleSheet.absoluteFillObject,
          headerBgAnimatedStyle,
          { backgroundColor: isDark ? 'rgba(18, 18, 18, 0.7)' : 'rgba(255, 255, 255, 0.7)' }
        ]}
      />
      
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={[
            styles.backButton,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
          ]}
          onPress={handleBackPress}
        >
          <Feather 
            name="arrow-left" 
            size={20} 
            color={isDark ? colors.text.primary : Colors.neutrals.gray800} 
          />
        </TouchableOpacity>
        
        <Animated.Text 
          style={[
            styles.headerTitle, 
            titleAnimatedStyle,
            { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }
          ]}
        >
          Notifications
        </Animated.Text>
        
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={[
                styles.headerButton,
                { 
                  backgroundColor: isDark 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.05)' 
                }
              ]}
              onPress={markAllAsRead}
            >
              <Text style={[
                styles.readAllText,
                { color: colors.primary[500] }
              ]}>
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              isFilterOpen && styles.filterButtonActive,
              { 
                backgroundColor: isFilterOpen
                  ? isDark 
                    ? colors.primary[500] + '30'
                    : colors.primary[500] + '15'
                  : isDark 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.05)'
              }
            ]}
            onPress={toggleFilter}
          >
            <Feather 
              name="filter" 
              size={18} 
              color={isFilterOpen ? colors.primary[500] : isDark ? colors.text.secondary : Colors.neutrals.gray700} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Filter tabs */}
      <Animated.View 
        style={[styles.filterContainer, filterAnimatedStyle]}
      >
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                selectedTab === tab.id && styles.activeTab,
                { 
                  backgroundColor: selectedTab === tab.id
                    ? isDark 
                      ? colors.primary[500] + '30'
                      : colors.primary[500] + '15'
                    : isDark 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.05)'
                }
              ]}
              onPress={() => selectTab(tab.id)}
            >
              <Feather 
                name={tab.icon} 
                size={14} 
                color={
                  selectedTab === tab.id 
                    ? colors.primary[500]
                    : isDark ? colors.text.secondary : Colors.neutrals.gray700
                } 
                style={styles.tabIcon}
              />
              <Text 
                style={[
                  styles.tabText,
                  selectedTab === tab.id && styles.activeTabText,
                  { 
                    color: selectedTab === tab.id 
                      ? colors.primary[500]
                      : isDark ? colors.text.secondary : Colors.neutrals.gray700
                  }
                ]}
              >
                {tab.label}
              </Text>
              
              {tab.id === 'unread' && unreadCount > 0 && (
                <View style={[
                  styles.badgeContainer,
                  { backgroundColor: colors.primary[500] }
                ]}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  )
  
  // Render footer with loading indicator
  const renderFooter = () => {
    if (!loadingMore) return null
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary[500]} />
        <Text style={[
          styles.loadingText,
          { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }
        ]}>
          Loading more...
        </Text>
      </View>
    )
  }
  
  // Render empty state
  const renderEmptyState = () => (
    <Animated.View 
      style={[styles.emptyContainer, emptyStateAnimatedStyle]}
    >
      <Animated.View 
        style={[
          styles.emptyIconContainer,
          { backgroundColor: isDark ? colors.card.background : Colors.neutrals.gray100 }
        ]}
        entering={ZoomIn.duration(500)}
      >
        <LinearGradient
          colors={isDark 
            ? [colors.background.dark, 'rgba(100, 100, 100, 0.1)'] 
            : ['rgba(240, 240, 240, 1)', 'rgba(250, 250, 250, 0.5)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Feather 
          name="bell-off" 
          size={48} 
          color={isDark ? colors.text.secondary : Colors.neutrals.gray400} 
        />
      </Animated.View>
      <Text style={[
        styles.emptyTitle,
        { color: isDark ? colors.text.primary : Colors.neutrals.gray800 }
      ]}>
        No notifications
      </Text>
      <Text style={[
        styles.emptyMessage,
        { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }
      ]}>
        {selectedTab === 'all' 
          ? "You're all caught up! No notifications to display."
          : `No ${selectedTab} notifications at the moment.`
        }
      </Text>
    </Animated.View>
  )
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? colors.background.light : Colors.background.light }
    ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? colors.background.light : Colors.background.light}
        translucent={true}
      />
      
      {/* Fixed header */}
      {renderHeader()}
      
      {/* Notifications List */}
      <FlatList
        ref={flatListRef}
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.notificationsList,
          { paddingTop: headerHeight.value }
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
            progressBackgroundColor={isDark ? colors.card.background : Colors.neutrals.white}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
      
      {/* Floating Action Button for marking all as read */}
      {unreadCount > 0 && (
        <Animated.View style={[styles.fabContainer, fabAnimatedStyle]}>
          <TouchableOpacity
            style={[
              styles.fab,
              { backgroundColor: colors.primary[500] }
            ]}
            onPress={markAllAsRead}
            activeOpacity={0.8}
          >
            <Feather name="check-circle" size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden'
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'space-between'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)'
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginLeft: 12
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerButton: {
    height: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)'
  },
  readAllText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)'
  },
  filterButtonActive: {
    backgroundColor: Colors.primary.blue + '20'
  },
  filterContainer: {
    overflow: 'hidden'
  },
  tabsContainer: {
    paddingBottom: 12,
    paddingRight: 16
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: Colors.neutrals.gray100,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  tabIcon: {
    marginRight: 6
  },
  activeTab: {
    backgroundColor: Colors.primary.blue + '20'
  },
  tabText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray700
  },
  activeTabText: {
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium
  },
  badgeContainer: {
    backgroundColor: Colors.primary.blue,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8
  },
  badgeText: {
    fontSize: 10,
    color: Colors.neutrals.white,
    fontWeight: Typography.weights.bold
  },
  notificationsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    minHeight: '100%'
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.neutrals.white,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutrals.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2
      }
    })
  },
  unreadNotification: {
    backgroundColor: Colors.primary.blue + '08',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.blue
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  notificationContent: {
    flex: 1,
    marginRight: 16
  },
  notificationTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray900,
    marginBottom: 4
  },
  unreadText: {
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900
  },
  notificationMessage: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray700,
    marginBottom: 8,
    lineHeight: 20
  },
  notificationTime: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray500
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary.blue,
    alignSelf: 'center'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.neutrals.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden'
  },
  emptyTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray800,
    marginBottom: 8
  },
  emptyMessage: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray600,
    textAlign: 'center',
    lineHeight: 24
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16
  },
  loadingText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginLeft: 8
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary.blue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8
      }
    })
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default NotificationsScreen