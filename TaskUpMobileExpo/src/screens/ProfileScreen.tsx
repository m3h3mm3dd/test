import React, { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  FadeOut,
  SlideInRight,
  ZoomIn,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import Avatar from '../components/Avatar/Avatar'
import StatusBadge from '../components/Badge/StatusBadge'
import Card from '../components/Card'
import { triggerImpact } from '../utils/HapticUtils'
import { formatDateString, timeAgo } from '../utils/helpers'
import { useTheme } from '../hooks/useColorScheme'

const { width } = Dimensions.get('window')
const HEADER_MAX_HEIGHT = 300
const HEADER_MIN_HEIGHT = Platform.OS === 'android' ? 60 : 90
const PROFILE_IMAGE_MAX_SIZE = 120
const PROFILE_IMAGE_MIN_SIZE = 40

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

interface UserStats {
  tasks: {
    completed: number
    inProgress: number
    total: number
  }
  projects: {
    active: number
    completed: number
    total: number
  }
  teams: number
  joined: string // ISO date string
}

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  department: string
  avatar?: string
  coverPhoto?: string
  bio?: string
  location?: string
  phone?: string
  website?: string
  socials?: {
    type: string
    url: string
  }[]
  skills?: string[]
  stats: UserStats
  availability: 'available' | 'busy' | 'away' | 'offline'
}

const ProfileScreen = ({ navigation, route }) => {
  const { userId } = route?.params || {}
  const [isCurrentUser, setIsCurrentUser] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState('stats')
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()
  
  // Animated Values
  const scrollY = useSharedValue(0)
  const headerHeight = useSharedValue(HEADER_MAX_HEIGHT)
  const profileImageSize = useSharedValue(PROFILE_IMAGE_MAX_SIZE)
  const headerOpacity = useSharedValue(1)
  const headerTitleOpacity = useSharedValue(0)
  const editButtonScale = useSharedValue(1)
  
  // Load user profile
  useEffect(() => {
    // Check if viewing own profile or someone else's
    if (userId) {
      setIsCurrentUser(userId === 'current')
    }
    
    // Mock profile data
    const mockProfile: UserProfile = {
      id: 'user123',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      role: 'Product Designer',
      department: 'Design',
      bio: 'Passionate product designer with 5+ years of experience in mobile and web application design. Focus on user-centered solutions and design systems.',
      location: 'New York, NY',
      phone: '+1 (555) 123-4567',
      website: 'alexjohnson.design',
      socials: [
        { type: 'twitter', url: 'https://twitter.com/alexjdesign' },
        { type: 'linkedin', url: 'https://linkedin.com/in/alexjdesign' },
        { type: 'dribbble', url: 'https://dribbble.com/alexjdesign' }
      ],
      skills: ['UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping', 'User Research'],
      stats: {
        tasks: {
          completed: 48,
          inProgress: 12,
          total: 60
        },
        projects: {
          active: 4,
          completed: 10,
          total: 14
        },
        teams: 3,
        joined: '2023-03-15T00:00:00.000Z'
      },
      availability: 'available'
    }
    
    setProfile(mockProfile)
  }, [userId])
  
  const handleBackPress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }
  
  const handleEditProfile = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    editButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 100 })
    )
    navigation.navigate('EditProfile')
  }
  
  const handleChangeTab = (tab: string) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    setActiveTab(tab)
  }
  
  const handleSettingsPress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    navigation.navigate('Settings')
  }
  
  const handleLogout = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Heavy)
    // Implement logout logic
  }
  
  // Scroll handler for animations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offsetY = event.contentOffset.y
      scrollY.value = offsetY
      
      // Calculate header height based on scroll position
      const newHeaderHeight = Math.max(
        HEADER_MIN_HEIGHT,
        HEADER_MAX_HEIGHT - offsetY
      )
      headerHeight.value = newHeaderHeight
      
      // Calculate profile image size based on scroll position
      const newImageSize = Math.max(
        PROFILE_IMAGE_MIN_SIZE,
        PROFILE_IMAGE_MAX_SIZE - (offsetY * 0.5)
      )
      profileImageSize.value = newImageSize
      
      // Calculate header opacity
      if (offsetY > 100) {
        headerOpacity.value = Math.max(0, 1 - ((offsetY - 100) / 100))
      } else {
        headerOpacity.value = 1
      }
      
      // Show/hide header title
      if (offsetY > HEADER_MAX_HEIGHT - 100) {
        headerTitleOpacity.value = Math.min(1, (offsetY - (HEADER_MAX_HEIGHT - 100)) / 50)
      } else {
        headerTitleOpacity.value = 0
      }
    }
  })
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value
    }
  })
  
  const headerContentStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [
        { 
          translateY: interpolate(
            headerOpacity.value,
            [0, 1],
            [20, 0],
            Extrapolation.CLAMP
          ) 
        }
      ]
    }
  })
  
  const profileImageStyle = useAnimatedStyle(() => {
    return {
      width: profileImageSize.value,
      height: profileImageSize.value,
      borderRadius: profileImageSize.value / 2,
      transform: [
        { 
          translateY: interpolate(
            scrollY.value,
            [0, HEADER_MAX_HEIGHT - 100],
            [0, -20],
            Extrapolation.CLAMP
          )
        }
      ]
    }
  })
  
  const profileInfoStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 80, 160],
        [1, 0.7, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        { 
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [0, 20],
            Extrapolation.CLAMP
          )
        }
      ]
    }
  })
  
  const headerTitleStyle = useAnimatedStyle(() => {
    return {
      opacity: headerTitleOpacity.value,
      transform: [
        { 
          translateY: interpolate(
            headerTitleOpacity.value,
            [0, 1],
            [20, 0],
            Extrapolation.CLAMP
          )
        }
      ]
    }
  })
  
  const editButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: editButtonScale.value }]
    }
  })
  
  // Calculate project completion percentage
  const projectCompletion = profile
    ? Math.round((profile.stats.projects.completed / profile.stats.projects.total) * 100)
    : 0
  
  // Get availability color
  const getAvailabilityStatus = (status?: string): 'online' | 'busy' | 'away' | 'offline' => {
    switch (status) {
      case 'available':
        return 'online'
      case 'busy':
        return 'busy'
      case 'away':
        return 'away'
      default:
        return 'offline'
    }
  }
  
  if (!profile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}>
        <ActivityIndicator color={colors.primary[500]} size="large" />
      </View>
    )
  }
  
  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="light-content" 
      />
      
      {/* Scrollable Content */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Spacer */}
        <View style={{ height: HEADER_MAX_HEIGHT }} />
        
        {/* Profile Info */}
        <View style={[
          styles.profileContainer, 
          { backgroundColor: isDark ? colors.background.dark : colors.background.light }
        ]}>
          {/* Name and Role */}
          <Animated.View style={[styles.profileInfo, profileInfoStyle]}>
            <Text style={[styles.profileName, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
              {profile.name}
            </Text>
            <Text style={[styles.profileRole, { color: isDark ? colors.text.secondary : Colors.neutrals.gray700 }]}>
              {profile.role}
            </Text>
            
            {/* Availability Status */}
            <View style={styles.availabilityContainer}>
              <StatusBadge status={getAvailabilityStatus(profile.availability)} size={8} />
              <Text style={[styles.availabilityText, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
                {profile.availability.charAt(0).toUpperCase() + profile.availability.slice(1)}
              </Text>
            </View>
          </Animated.View>
          
          {/* Tab Navigation */}
          <View style={[
            styles.tabsContainer, 
            { borderBottomColor: isDark ? colors.border : Colors.neutrals.gray200 }
          ]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'stats' && [
                  styles.activeTab, 
                  { borderBottomColor: colors.primary[500] }
                ]
              ]}
              onPress={() => handleChangeTab('stats')}
            >
              <Text 
                style={[
                  styles.tabText,
                  { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 },
                  activeTab === 'stats' && [
                    styles.activeTabText,
                    { color: colors.primary[500] }
                  ]
                ]}
              >
                Statistics
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'about' && [
                  styles.activeTab,
                  { borderBottomColor: colors.primary[500] }
                ]
              ]}
              onPress={() => handleChangeTab('about')}
            >
              <Text 
                style={[
                  styles.tabText,
                  { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 },
                  activeTab === 'about' && [
                    styles.activeTabText,
                    { color: colors.primary[500] }
                  ]
                ]}
              >
                About
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'activity' && [
                  styles.activeTab,
                  { borderBottomColor: colors.primary[500] }
                ]
              ]}
              onPress={() => handleChangeTab('activity')}
            >
              <Text 
                style={[
                  styles.tabText,
                  { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 },
                  activeTab === 'activity' && [
                    styles.activeTabText,
                    { color: colors.primary[500] }
                  ]
                ]}
              >
                Activity
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'stats' && (
              <Animated.View entering={FadeIn.duration(300)}>
                {/* Stats Cards */}
                <View style={styles.statsCardsContainer}>
                  <Animated.View 
                    style={styles.statsCard}
                    entering={SlideInRight.delay(100).duration(300)}
                  >
                    <LinearGradient
                      colors={[colors.primary[500], colors.primary[700]]}
                      style={styles.statsCardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.statsCardHeader}>
                        <Feather name="check-square" size={20} color={Colors.neutrals.white} />
                        <Text style={styles.statsCardTitle}>Tasks</Text>
                      </View>
                      
                      <Text style={styles.statsCardValue}>
                        {profile.stats.tasks.completed}/{profile.stats.tasks.total}
                      </Text>
                      
                      <View style={styles.statsProgressContainer}>
                        <View style={styles.statsProgressTrack}>
                          <View 
                            style={[
                              styles.statsProgressFill,
                              { 
                                width: `${Math.round(
                                  (profile.stats.tasks.completed / profile.stats.tasks.total) * 100
                                )}%` 
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.statsProgressText}>
                          {Math.round(
                            (profile.stats.tasks.completed / profile.stats.tasks.total) * 100
                          )}% Complete
                        </Text>
                      </View>
                    </LinearGradient>
                  </Animated.View>
                  
                  <Animated.View 
                    style={styles.statsCard}
                    entering={SlideInRight.delay(200).duration(300)}
                  >
                    <LinearGradient
                      colors={[Colors.secondary.green, '#009688']}
                      style={styles.statsCardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.statsCardHeader}>
                        <Feather name="briefcase" size={20} color={Colors.neutrals.white} />
                        <Text style={styles.statsCardTitle}>Projects</Text>
                      </View>
                      
                      <Text style={styles.statsCardValue}>
                        {profile.stats.projects.completed}/{profile.stats.projects.total}
                      </Text>
                      
                      <View style={styles.statsProgressContainer}>
                        <View style={styles.statsProgressTrack}>
                          <View 
                            style={[
                              styles.statsProgressFill,
                              { width: `${projectCompletion}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.statsProgressText}>
                          {projectCompletion}% Complete
                        </Text>
                      </View>
                    </LinearGradient>
                  </Animated.View>
                </View>
                
                {/* Additional Stats */}
                <Card 
                  style={styles.additionalStatsContainer}
                  animationType="spring"
                >
                  <Animated.View entering={SlideInRight.delay(300).duration(300)}>
                    <View style={styles.additionalStatItem}>
                      <View style={[styles.additionalStatIcon, { backgroundColor: `${colors.primary[500]}20` }]}>
                        <Feather name="users" size={16} color={colors.primary[500]} />
                      </View>
                      <View style={styles.additionalStatContent}>
                        <Text style={[styles.additionalStatLabel, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
                          Teams
                        </Text>
                        <Text style={[styles.additionalStatValue, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
                          {profile.stats.teams}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.divider, { backgroundColor: isDark ? colors.border : Colors.neutrals.gray200 }]} />
                    
                    <View style={styles.additionalStatItem}>
                      <View style={[styles.additionalStatIcon, { backgroundColor: `${Colors.secondary.green}20` }]}>
                        <Feather name="trending-up" size={16} color={Colors.secondary.green} />
                      </View>
                      <View style={styles.additionalStatContent}>
                        <Text style={[styles.additionalStatLabel, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
                          In Progress
                        </Text>
                        <Text style={[styles.additionalStatValue, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
                          {profile.stats.tasks.inProgress}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.divider, { backgroundColor: isDark ? colors.border : Colors.neutrals.gray200 }]} />
                    
                    <View style={styles.additionalStatItem}>
                      <View style={[styles.additionalStatIcon, { backgroundColor: 'rgba(156, 39, 176, 0.1)' }]}>
                        <Feather name="calendar" size={16} color="#9C27B0" />
                      </View>
                      <View style={styles.additionalStatContent}>
                        <Text style={[styles.additionalStatLabel, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
                          Joined
                        </Text>
                        <Text style={[styles.additionalStatValue, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
                          {formatDateString(profile.stats.joined, { month: 'long', year: 'numeric' })}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                </Card>
              </Animated.View>
            )}
            
            {activeTab === 'about' && (
              <Animated.View 
                entering={FadeIn.duration(300)}
              >
                <Card style={styles.aboutContainer}>
                  {/* Bio Section */}
                  <View style={styles.bioSection}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
                      Bio
                    </Text>
                    <Text style={[styles.bioText, { color: isDark ? colors.text.secondary : Colors.neutrals.gray700 }]}>
                      {profile.bio}
                    </Text>
                  </View>
                  
                  <View style={[styles.divider, { backgroundColor: isDark ? colors.border : Colors.neutrals.gray200 }]} />
                  
                  {/* Contact Section */}
                  <View style={styles.contactSection}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
                      Contact Information
                    </Text>
                    
                    <View style={styles.contactItem}>
                      <Feather 
                        name="mail" 
                        size={16} 
                        color={isDark ? colors.text.secondary : Colors.neutrals.gray700} 
                      />
                      <Text style={[styles.contactText, { color: isDark ? colors.text.primary : Colors.neutrals.gray800 }]}>
                        {profile.email}
                      </Text>
                    </View>
                    
                    {profile.phone && (
                      <View style={styles.contactItem}>
                        <Feather 
                          name="phone" 
                          size={16} 
                          color={isDark ? colors.text.secondary : Colors.neutrals.gray700} 
                        />
                        <Text style={[styles.contactText, { color: isDark ? colors.text.primary : Colors.neutrals.gray800 }]}>
                          {profile.phone}
                        </Text>
                      </View>
                    )}
                    
                    {profile.location && (
                      <View style={styles.contactItem}>
                        <Feather 
                          name="map-pin" 
                          size={16} 
                          color={isDark ? colors.text.secondary : Colors.neutrals.gray700} 
                        />
                        <Text style={[styles.contactText, { color: isDark ? colors.text.primary : Colors.neutrals.gray800 }]}>
                          {profile.location}
                        </Text>
                      </View>
                    )}
                    
                    {profile.website && (
                      <View style={styles.contactItem}>
                        <Feather 
                          name="globe" 
                          size={16} 
                          color={isDark ? colors.text.secondary : Colors.neutrals.gray700} 
                        />
                        <Text style={[styles.contactText, { color: isDark ? colors.text.primary : Colors.neutrals.gray800 }]}>
                          {profile.website}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={[styles.divider, { backgroundColor: isDark ? colors.border : Colors.neutrals.gray200 }]} />
                  
                  {/* Skills Section */}
                  {profile.skills && profile.skills.length > 0 && (
                    <View style={styles.skillsSection}>
                      <Text style={[styles.sectionTitle, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
                        Skills
                      </Text>
                      
                      <View style={styles.skillsContainer}>
                        {profile.skills.map((skill, index) => (
                          <Animated.View 
                            key={index} 
                            style={styles.skillBadge}
                            entering={FadeIn.delay(100 + index * 50).duration(300)}
                          >
                            <Text style={[styles.skillText, { color: colors.primary[500] }]}>
                              {skill}
                            </Text>
                          </Animated.View>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  <View style={[styles.divider, { backgroundColor: isDark ? colors.border : Colors.neutrals.gray200 }]} />
                  
                  {/* Social Links */}
                  {profile.socials && profile.socials.length > 0 && (
                    <View style={styles.socialsSection}>
                      <Text style={[styles.sectionTitle, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
                        Social Profiles
                      </Text>
                      
                      <View style={styles.socialsContainer}>
                        {profile.socials.map((social, index) => (
                          <TouchableOpacity 
                            key={index}
                            style={[styles.socialButton, { backgroundColor: colors.primary[500] }]}
                          >
                            <Feather
                              name={getSocialIcon(social.type)}
                              size={20}
                              color={Colors.neutrals.white}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  <View style={[styles.divider, { backgroundColor: isDark ? colors.border : Colors.neutrals.gray200 }]} />
                  
                  {/* Department */}
                  <View style={styles.departmentSection}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
                      Department
                    </Text>
                    <View style={[styles.departmentBadge, { backgroundColor: 'rgba(156, 39, 176, 0.1)' }]}>
                      <Text style={[styles.departmentText, { color: '#9C27B0' }]}>
                        {profile.department}
                      </Text>
                    </View>
                  </View>
                </Card>
              </Animated.View>
            )}
            
            {activeTab === 'activity' && (
              <Card style={styles.activityContainer}>
                <Animated.View entering={FadeIn.duration(300)}>
                  <Text style={[styles.sectionTitle, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
                    Recent Activity
                  </Text>
                  
                  <View style={styles.activityTimeline}>
                    <ActivityItem 
                      icon="check-square"
                      iconColor={Colors.secondary.green}
                      time="2 hours ago"
                      delay={100}
                      isDark={isDark}
                      colors={colors}
                    >
                      <Text style={[styles.activityText, { color: isDark ? colors.text.primary : Colors.neutrals.gray800 }]}>
                        <Text style={[styles.activityHighlight, { color: isDark ? colors.primary[300] : colors.primary[500] }]}>
                          Completed task:
                        </Text> Mobile App Wireframes
                      </Text>
                    </ActivityItem>
                    
                    <ActivityItem 
                      icon="message-square"
                      iconColor="#9C27B0"
                      time="Yesterday, 4:32 PM"
                      delay={200}
                      isDark={isDark}
                      colors={colors}
                    >
                      <Text style={[styles.activityText, { color: isDark ? colors.text.primary : Colors.neutrals.gray800 }]}>
                        <Text style={[styles.activityHighlight, { color: isDark ? colors.primary[300] : colors.primary[500] }]}>
                          Commented on:
                        </Text> User Flow Diagrams
                      </Text>
                    </ActivityItem>
                    
                    <ActivityItem 
                      icon="plus"
                      iconColor={Colors.secondary.green}
                      time="2 days ago"
                      delay={300}
                      isDark={isDark}
                      colors={colors}
                    >
                      <Text style={[styles.activityText, { color: isDark ? colors.text.primary : Colors.neutrals.gray800 }]}>
                        <Text style={[styles.activityHighlight, { color: isDark ? colors.primary[300] : colors.primary[500] }]}>
                          Created task:
                        </Text> Finalize Color Palette
                      </Text>
                    </ActivityItem>
                    
                    <ActivityItem 
                      icon="briefcase"
                      iconColor="#FF9800"
                      time="1 week ago"
                      delay={400}
                      isDark={isDark}
                      colors={colors}
                      isLast
                    >
                      <Text style={[styles.activityText, { color: isDark ? colors.text.primary : Colors.neutrals.gray800 }]}>
                        <Text style={[styles.activityHighlight, { color: isDark ? colors.primary[300] : colors.primary[500] }]}>
                          Joined project:
                        </Text> Website Redesign
                      </Text>
                    </ActivityItem>
                  </View>
                  
                  <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={[styles.viewAllText, { color: colors.primary[500] }]}>
                      View All Activity
                    </Text>
                    <Feather name="chevron-right" size={16} color={colors.primary[500]} />
                  </TouchableOpacity>
                </Animated.View>
              </Card>
            )}
          </View>
          
          {/* Settings and Logout Buttons (Only for current user) */}
          {isCurrentUser && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[
                  styles.settingsButton, 
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : Colors.neutrals.gray100 }
                ]}
                onPress={handleSettingsPress}
              >
                <Feather 
                  name="settings" 
                  size={20} 
                  color={isDark ? colors.text.primary : Colors.neutrals.gray800} 
                />
                <Text style={[
                  styles.settingsButtonText, 
                  { color: isDark ? colors.text.primary : Colors.neutrals.gray800 }
                ]}>
                  Settings
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.logoutButton, { backgroundColor: `${Colors.status.error}10` }]}
                onPress={handleLogout}
              >
                <Feather name="log-out" size={20} color={Colors.status.error} />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Bottom Padding */}
          <View style={{ height: insets.bottom + 20 }} />
        </View>
      </Animated.ScrollView>
      
      {/* Header (Fixed position) */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <AnimatedLinearGradient
          colors={[colors.primary[500], colors.primary[700]]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Back Button */}
        <TouchableOpacity 
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={handleBackPress}
        >
          <Feather name="arrow-left" size={24} color={Colors.neutrals.white} />
        </TouchableOpacity>
        
        {/* Header Title (Appears on Scroll) */}
        <Animated.Text 
          style={[
            styles.headerTitle, 
            headerTitleStyle,
            { top: insets.top + 12 }
          ]}
        >
          {profile.name}
        </Animated.Text>
        
        {/* Edit Profile Button (Only for current user) */}
        {isCurrentUser && (
          <Animated.View 
            style={[
              styles.editButton, 
              { top: insets.top + 10 },
              editButtonStyle
            ]}
          >
            <TouchableOpacity 
              style={styles.editButtonTouchable}
              onPress={handleEditProfile}
            >
              <Feather name="edit-2" size={20} color={Colors.neutrals.white} />
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* Header Content */}
        <Animated.View style={[styles.headerContent, headerContentStyle]}>
          {/* Profile Image */}
          <Animated.View style={[styles.profileImageContainer, profileImageStyle]}>
            <Avatar
              name={profile.name}
              imageUrl={profile.avatar}
              size={PROFILE_IMAGE_MAX_SIZE}
              status={getAvailabilityStatus(profile.availability)}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

// Helper function to get social media icon
const getSocialIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'twitter':
      return 'twitter'
    case 'linkedin':
      return 'linkedin'
    case 'github':
      return 'github'
    case 'dribbble':
      return 'dribbble'
    case 'behance':
      return 'behance'
    case 'instagram':
      return 'instagram'
    default:
      return 'link'
  }
}

// Activity Item Component for Timeline
interface ActivityItemProps {
  icon: string;
  iconColor: string;
  time: string;
  children: React.ReactNode;
  delay?: number;
  isDark?: boolean;
  colors: any;
  isLast?: boolean;
}

const ActivityItem = ({ 
  icon, 
  iconColor, 
  time, 
  children, 
  delay = 0,
  isDark = false,
  colors,
  isLast = false 
}: ActivityItemProps) => {
  return (
    <Animated.View 
      style={styles.activityItem}
      entering={SlideInRight.delay(delay).duration(300)}
    >
      <View style={styles.activityIconContainer}>
        <View style={[styles.activityIcon, { backgroundColor: iconColor }]}>
          <Feather name={icon} size={16} color={Colors.neutrals.white} />
        </View>
        {!isLast && (
          <View style={[
            styles.activityLine, 
            { backgroundColor: isDark ? colors.border : Colors.neutrals.gray300 }
          ]} />
        )}
      </View>
      
      <View style={[
        styles.activityContent,
        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : Colors.neutrals.white }
      ]}>
        {children}
        <Text style={[
          styles.activityTime, 
          { color: isDark ? colors.text.secondary : Colors.neutrals.gray500 }
        ]}>
          {time}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light
  },
  scrollContent: {
    flexGrow: 1
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 10
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20
  },
  headerTitle: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  editButton: {
    position: 'absolute',
    right: 16,
    zIndex: 10
  },
  editButtonTouchable: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileImageContainer: {
    overflow: 'hidden'
  },
  profileContainer: {
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 20
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 24
  },
  profileName: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginBottom: 4
  },
  profileRole: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray700,
    marginBottom: 8
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16
  },
  availabilityText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginLeft: 6
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.blue
  },
  tabText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray600
  },
  activeTabText: {
    fontWeight: Typography.weights.semibold,
    color: Colors.primary.blue
  },
  tabContent: {
    paddingTop: 8
  },
  statsCardsContainer: {
    flexDirection: 'row',
    marginBottom: 24
  },
  statsCard: {
    flex: 1,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutrals.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 8
      },
      android: {
        elevation: 4
      }
    })
  },
  statsCardGradient: {
    flex: 1,
    padding: 16
  },
  statsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  statsCardTitle: {
    marginLeft: 8,
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.9)'
  },
  statsCardValue: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginBottom: 16
  },
  statsProgressContainer: {
    marginTop: 'auto'
  },
  statsProgressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8
  },
  statsProgressFill: {
    height: '100%',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 2
  },
  statsProgressText: {
    fontSize: Typography.sizes.caption,
    color: 'rgba(255, 255, 255, 0.9)'
  },
  additionalStatsContainer: {
    marginBottom: 24
  },
  additionalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12
  },
  additionalStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  additionalStatContent: {
    flex: 1
  },
  additionalStatLabel: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600
  },
  additionalStatValue: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900
  },
  aboutContainer: {
    marginBottom: 24
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutrals.gray200,
    marginVertical: 16
  },
  sectionTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 12
  },
  bioSection: {
    marginBottom: 16
  },
  bioText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray700,
    lineHeight: 22
  },
  contactSection: {
    marginBottom: 16
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  contactText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray800,
    marginLeft: 12
  },
  skillsSection: {
    marginBottom: 16
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  skillBadge: {
    backgroundColor: Colors.primary.blue + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8
  },
  skillText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium
  },
  socialsSection: {
    marginBottom: 16
  },
  socialsContainer: {
    flexDirection: 'row'
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  departmentSection: {
    marginBottom: 4
  },
  departmentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary.purple + '10',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16
  },
  departmentText: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.purple,
    fontWeight: Typography.weights.semibold
  },
  activityContainer: {
    marginBottom: 24
  },
  activityTimeline: {
    marginVertical: 12
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16
  },
  activityIconContainer: {
    alignItems: 'center',
    width: 30,
    marginRight: 12
  },
  activityIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  activityLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
    marginLeft: 14,
    backgroundColor: Colors.neutrals.gray300
  },
  activityContent: {
    flex: 1,
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutrals.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4
      },
      android: {
        elevation: 2
      }
    })
  },
  activityText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray800,
    marginBottom: 6,
    lineHeight: 22
  },
  activityHighlight: {
    fontWeight: Typography.weights.semibold,
    color: Colors.primary.blue
  },
  activityTime: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray500
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8
  },
  viewAllText: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium,
    marginRight: 4
  },
  actionButtonsContainer: {
    marginTop: 16,
    marginBottom: 8
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.neutrals.gray100,
    borderRadius: 12,
    marginBottom: 12
  },
  settingsButtonText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray800,
    marginLeft: 8
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.status.error + '10',
    borderRadius: 12
  },
  logoutButtonText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    color: Colors.status.error,
    marginLeft: 8
  }
})

export default ProfileScreen