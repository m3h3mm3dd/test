import React, { useState, useEffect, useRef } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StatusBar, 
  SafeAreaView,
  Dimensions,
  RefreshControl
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
  SlideInLeft,
  ZoomIn,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SwipeableRow } from '../components/SwipeableRow'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import { triggerImpact } from '../utils/HapticUtils'

const { width, height } = Dimensions.get('window')
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedTab, setSelectedTab] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Refs
  const flatListRef = useRef<FlatList>(null)
  
  // Animated values
  const headerHeight = useSharedValue(120)
  const filterHeight = useSharedValue(0)
  const filterOpacity = useSharedValue(0)
  const scrollY = useSharedValue(0)
  const notificationItemScale = useSharedValue(1)
  const emptyAnimationProgress = useSharedValue(0)
  
  // Tabs for filtering
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'mentions', label: 'Mentions' },
    { id: 'tasks', label: 'Tasks' }
  ]
  
  // Load notifications data
  useEffect(() => {
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
  }, [])
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true)
    
    // Simulate refreshing data
    setTimeout(() => {
      setRefreshing(false)
      triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    }, 1500)
  }
  
  // Filter notifications based on selected tab
  const getFilteredNotifications = () => {
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
  }
  
  const handleBackPress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }
  
  const handleNotificationPress = (notification: Notification) => {
    // Animate notification item
    notificationItemScale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withTiming(1, { duration: 150 })
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
    
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
    
    setUnreadCount(0)
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
      filterHeight.value = withTiming(60, { duration: 300 })
      filterOpacity.value = withTiming(1, { duration: 300 })
    } else {
      // Close filter
      filterHeight.value = withTiming(0, { duration: 300 })
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
    
    // Adjust header height based on scroll
    if (offsetY > 20) {
      headerHeight.value = withTiming(80, { duration: 200 })
    } else {
      headerHeight.value = withTiming(120, { duration: 200 })
    }
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
      shadowOpacity: interpolate(
        scrollY.value,
        [0, 20],
        [0, 0.1],
        Extrapolation.CLAMP
      ),
      elevation: interpolate(
        scrollY.value,
        [0, 20],
        [0, 4],
        Extrapolation.CLAMP
      )
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
      fontSize
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
  
  const renderLeftActions = (notification: Notification) => [
    {
      icon: 'check',
      label: 'Read',
      color: Colors.status.success,
      onPress: () => markAsRead(notification.id)
    }
  ]
  
  const renderRightActions = (notification: Notification) => [
    {
      icon: 'trash-2',
      label: 'Delete',
      color: Colors.status.error,
      onPress: () => deleteNotification(notification.id),
      destructive: true
    }
  ]
  
  const renderNotification = ({ item, index }) => {
    const filteredNotifications = getFilteredNotifications()
    
    return (
      <Animated.View 
        entering={SlideInRight.delay(index * 50).duration(300)}
        style={notificationItemAnimatedStyle}
      >
        <SwipeableRow
          leftActions={!item.read ? renderLeftActions(item) : []}
          rightActions={renderRightActions(item)}
        >
          <TouchableOpacity
            style={[
              styles.notificationItem,
              !item.read && styles.unreadNotification
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
                  !item.read && styles.unreadText
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              
              <Text 
                style={styles.notificationMessage}
                numberOfLines={2}
              >
                {item.message}
              </Text>
              
              <Text style={styles.notificationTime}>
                {formatNotificationTime(item.timestamp)}
              </Text>
            </View>
            
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        </SwipeableRow>
      </Animated.View>
    )
  }
  
  // Get background color for notification icon
  const getIconBackgroundColor = (type: string) => {
    switch (type) {
      case 'mention':
        return Colors.primary.blue
      case 'task':
        return Colors.secondary.green
      case 'comment':
        return Colors.primary.purple
      case 'project':
        return Colors.primary.yellow
      case 'team':
        return Colors.secondary.blue
      default:
        return Colors.neutrals.gray600
    }
  }
  
  const filteredNotifications = getFilteredNotifications()
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
      
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Feather name="arrow-left" size={24} color={Colors.neutrals.gray800} />
          </TouchableOpacity>
          
          <Animated.Text style={[styles.headerTitle, titleAnimatedStyle]}>
            Notifications
          </Animated.Text>
          
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={markAllAsRead}
              >
                <Text style={styles.readAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.filterButton,
                isFilterOpen && styles.filterButtonActive
              ]}
              onPress={toggleFilter}
            >
              <Feather 
                name="filter" 
                size={20} 
                color={isFilterOpen ? Colors.primary.blue : Colors.neutrals.gray700} 
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
                  selectedTab === tab.id && styles.activeTab
                ]}
                onPress={() => selectTab(tab.id)}
              >
                <Text 
                  style={[
                    styles.tabText,
                    selectedTab === tab.id && styles.activeTabText
                  ]}
                >
                  {tab.label}
                </Text>
                
                {tab.id === 'unread' && unreadCount > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </Animated.View>
      
      {/* Notifications List */}
      <FlatList
        ref={flatListRef}
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notificationsList}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.blue}
            colors={[Colors.primary.blue]}
          />
        }
        ListEmptyComponent={
          <Animated.View 
            style={[styles.emptyContainer, emptyStateAnimatedStyle]}
          >
            <Animated.View 
              style={styles.emptyIconContainer}
              entering={ZoomIn.duration(500)}
            >
              <Feather name="bell-off" size={48} color={Colors.neutrals.gray400} />
            </Animated.View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyMessage}>
              {selectedTab === 'all' 
                ? "You're all caught up! No notifications to display."
                : `No ${selectedTab} notifications at the moment.`
              }
            </Text>
          </Animated.View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    paddingHorizontal: 16,
    backgroundColor: Colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    zIndex: 10
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginLeft: 8
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerButton: {
    marginLeft: 16
  },
  readAllText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8
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
    paddingTop: 8,
    paddingBottom: 24,
    minHeight: height - 180
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  unreadNotification: {
    backgroundColor: Colors.primary.blue + '05',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.blue
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    lineHeight: 18
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
    paddingTop: 60,
    paddingHorizontal: 32
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.neutrals.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
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
    lineHeight: 22
  }
})

export default NotificationsScreen