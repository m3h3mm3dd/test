import React, { useState, useEffect, useRef } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView,
  Image, 
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut,
  SlideInRight,
  ZoomIn,
  runOnJS,
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
import { triggerImpact } from '../utils/HapticUtils'

const { width, height } = Dimensions.get('window')
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
    triggerImpact()
    navigation.goBack()
  }
  
  const handleEditProfile = () => {
    triggerImpact()
    editButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 100 })
    )
    navigation.navigate('EditProfile')
  }
  
  const handleChangeTab = (tab: string) => {
    triggerImpact()
    setActiveTab(tab)
  }
  
  const handleSettingsPress = () => {
    triggerImpact()
    navigation.navigate('Settings')
  }
  
  const handleLogout = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
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
      opacity: headerOpacity.value
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
  
  // Format join date
  const formatJoinDate = (isoString?: string) => {
    if (!isoString) return ''
    
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  
  // Get availability color
  const getAvailabilityColor = (status?: string) => {
    switch (status) {
      case 'available':
        return Colors.status.success
      case 'busy':
        return Colors.status.error
      case 'away':
        return Colors.status.warning
      default:
        return Colors.neutrals.gray400
    }
  }
  
  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary.blue} size="large" />
      </View>
    )
  }
  
  return (
    <View style={styles.container}>
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
        <View style={styles.profileContainer}>
          {/* Name and Role */}
          <Animated.View style={[styles.profileInfo, profileInfoStyle]}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileRole}>{profile.role}</Text>
            
            {/* Availability Status */}
            <View style={styles.availabilityContainer}>
              <View 
                style={[
                  styles.availabilityDot,
                  { backgroundColor: getAvailabilityColor(profile.availability) }
                ]} 
              />
              <Text style={styles.availabilityText}>
                {profile.availability.charAt(0).toUpperCase() + profile.availability.slice(1)}
              </Text>
            </View>
          </Animated.View>
          
          {/* Tab Navigation */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'stats' && styles.activeTab
              ]}
              onPress={() => handleChangeTab('stats')}
            >
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'stats' && styles.activeTabText
                ]}
              >
                Statistics
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'about' && styles.activeTab
              ]}
              onPress={() => handleChangeTab('about')}
            >
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'about' && styles.activeTabText
                ]}
              >
                About
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'activity' && styles.activeTab
              ]}
              onPress={() => handleChangeTab('activity')}
            >
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'activity' && styles.activeTabText
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
                      colors={[Colors.primary.blue, Colors.primary.darkBlue]}
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
                <Animated.View 
                  style={styles.additionalStatsContainer}
                  entering={SlideInRight.delay(300).duration(300)}
                >
                  <View style={styles.additionalStatItem}>
                    <View style={styles.additionalStatIcon}>
                      <Feather name="users" size={16} color={Colors.primary.blue} />
                    </View>
                    <View style={styles.additionalStatContent}>
                      <Text style={styles.additionalStatLabel}>Teams</Text>
                      <Text style={styles.additionalStatValue}>{profile.stats.teams}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.additionalStatItem}>
                    <View style={styles.additionalStatIcon}>
                      <Feather name="trending-up" size={16} color={Colors.secondary.green} />
                    </View>
                    <View style={styles.additionalStatContent}>
                      <Text style={styles.additionalStatLabel}>In Progress</Text>
                      <Text style={styles.additionalStatValue}>{profile.stats.tasks.inProgress}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.additionalStatItem}>
                    <View style={styles.additionalStatIcon}>
                      <Feather name="calendar" size={16} color={Colors.primary.purple} />
                    </View>
                    <View style={styles.additionalStatContent}>
                      <Text style={styles.additionalStatLabel}>Joined</Text>
                      <Text style={styles.additionalStatValue}>
                        {formatJoinDate(profile.stats.joined)}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </Animated.View>
            )}
            
            {activeTab === 'about' && (
              <Animated.View 
                style={styles.aboutContainer}
                entering={FadeIn.duration(300)}
              >
                {/* Bio Section */}
                <View style={styles.bioSection}>
                  <Text style={styles.sectionTitle}>Bio</Text>
                  <Text style={styles.bioText}>{profile.bio}</Text>
                </View>
                
                {/* Contact Section */}
                <View style={styles.contactSection}>
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                  
                  <View style={styles.contactItem}>
                    <Feather name="mail" size={16} color={Colors.neutrals.gray700} />
                    <Text style={styles.contactText}>{profile.email}</Text>
                  </View>
                  
                  {profile.phone && (
                    <View style={styles.contactItem}>
                      <Feather name="phone" size={16} color={Colors.neutrals.gray700} />
                      <Text style={styles.contactText}>{profile.phone}</Text>
                    </View>
                  )}
                  
                  {profile.location && (
                    <View style={styles.contactItem}>
                      <Feather name="map-pin" size={16} color={Colors.neutrals.gray700} />
                      <Text style={styles.contactText}>{profile.location}</Text>
                    </View>
                  )}
                  
                  {profile.website && (
                    <View style={styles.contactItem}>
                      <Feather name="globe" size={16} color={Colors.neutrals.gray700} />
                      <Text style={styles.contactText}>{profile.website}</Text>
                    </View>
                  )}
                </View>
                
                {/* Skills Section */}
                {profile.skills && profile.skills.length > 0 && (
                  <View style={styles.skillsSection}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    
                    <View style={styles.skillsContainer}>
                      {profile.skills.map((skill, index) => (
                        <View key={index} style={styles.skillBadge}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                
                {/* Social Links */}
                {profile.socials && profile.socials.length > 0 && (
                  <View style={styles.socialsSection}>
                    <Text style={styles.sectionTitle}>Social Profiles</Text>
                    
                    <View style={styles.socialsContainer}>
                      {profile.socials.map((social, index) => (
                        <TouchableOpacity 
                          key={index}
                          style={styles.socialButton}
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
                
                {/* Department */}
                <View style={styles.departmentSection}>
                  <Text style={styles.sectionTitle}>Department</Text>
                  <View style={styles.departmentBadge}>
                    <Text style={styles.departmentText}>{profile.department}</Text>
                  </View>
                </View>
              </Animated.View>
            )}
            
            {activeTab === 'activity' && (
              <Animated.View 
                style={styles.activityContainer}
                entering={FadeIn.duration(300)}
              >
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                
                <View style={styles.activityTimeline}>
                  <Animated.View 
                    style={styles.activityItem}
                    entering={SlideInRight.delay(100).duration(300)}
                  >
                    <View style={styles.activityIconContainer}>
                      <Feather name="check-square" size={16} color={Colors.neutrals.white} />
                    </View>
                    <View style={styles.activityLineContainer}>
                      <View style={styles.activityLine} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>
                        <Text style={styles.activityHighlight}>Completed task:</Text> Mobile App Wireframes
                      </Text>
                      <Text style={styles.activityTime}>2 hours ago</Text>
                    </View>
                  </Animated.View>
                  
                  <Animated.View 
                    style={styles.activityItem}
                    entering={SlideInRight.delay(200).duration(300)}
                  >
                    <View style={[styles.activityIconContainer, { backgroundColor: Colors.primary.purple }]}>
                      <Feather name="message-square" size={16} color={Colors.neutrals.white} />
                    </View>
                    <View style={styles.activityLineContainer}>
                      <View style={styles.activityLine} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>
                        <Text style={styles.activityHighlight}>Commented on:</Text> User Flow Diagrams
                      </Text>
                      <Text style={styles.activityTime}>Yesterday, 4:32 PM</Text>
                    </View>
                  </Animated.View>
                  
                  <Animated.View 
                    style={styles.activityItem}
                    entering={SlideInRight.delay(300).duration(300)}
                  >
                    <View style={[styles.activityIconContainer, { backgroundColor: Colors.secondary.green }]}>
                      <Feather name="plus" size={16} color={Colors.neutrals.white} />
                    </View>
                    <View style={styles.activityLineContainer}>
                      <View style={styles.activityLine} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>
                        <Text style={styles.activityHighlight}>Created task:</Text> Finalize Color Palette
                      </Text>
                      <Text style={styles.activityTime}>2 days ago</Text>
                    </View>
                  </Animated.View>
                  
                  <Animated.View 
                    style={styles.activityItem}
                    entering={SlideInRight.delay(400).duration(300)}
                  >
                    <View style={[styles.activityIconContainer, { backgroundColor: Colors.primary.yellow }]}>
                      <Feather name="briefcase" size={16} color={Colors.neutrals.white} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>
                        <Text style={styles.activityHighlight}>Joined project:</Text> Website Redesign
                      </Text>
                      <Text style={styles.activityTime}>1 week ago</Text>
                    </View>
                  </Animated.View>
                </View>
                
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All Activity</Text>
                  <Feather name="chevron-right" size={16} color={Colors.primary.blue} />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
          
          {/* Settings and Logout Buttons (Only for current user) */}
          {isCurrentUser && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={handleSettingsPress}
              >
                <Feather name="settings" size={20} color={Colors.neutrals.gray800} />
                <Text style={styles.settingsButtonText}>Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Feather name="log-out" size={20} color={Colors.status.error} />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Bottom Padding */}
          <View style={{ height: 40 }} />
        </View>
      </Animated.ScrollView>
      
      {/* Header (Fixed position) */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <AnimatedLinearGradient
          colors={['#3D5AFE', '#304FFE']}
          style={[StyleSheet.absoluteFill]}
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
    overflow: 'hidden'
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
    borderWidth: 4,
    borderColor: Colors.neutrals.white,
    borderRadius: PROFILE_IMAGE_MAX_SIZE / 2,
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
    alignItems: 'center'
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  availabilityText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600
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
    marginHorizontal: 6
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
    backgroundColor: Colors.neutrals.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  additionalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  additionalStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(61, 90, 254, 0.1)',
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
    backgroundColor: Colors.neutrals.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  sectionTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 12
  },
  bioSection: {
    marginBottom: 24
  },
  bioText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray700,
    lineHeight: 22
  },
  contactSection: {
    marginBottom: 24
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
    marginBottom: 24
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
    marginBottom: 24
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
    backgroundColor: Colors.neutrals.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  activityTimeline: {
    marginLeft: 8,
    marginBottom: 16
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative'
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2
  },
  activityLineContainer: {
    position: 'absolute',
    top: 32,
    left: 16,
    bottom: -24,
    alignItems: 'center',
    zIndex: 1
  },
  activityLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.neutrals.gray300
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
    paddingTop: 4
  },
  activityText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray800,
    marginBottom: 4
  },
  activityHighlight: {
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900
  },
  activityTime: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray500
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },
  viewAllText: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.blue,
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