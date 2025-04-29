import React, { useState, useEffect, useRef } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Dimensions,
  FlatList
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  SlideInRight,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import Avatar from '../components/Avatar/Avatar'
import AvatarStack from '../components/Avatar/AvatarStack'
import { triggerImpact } from '../utils/HapticUtils'

const { width, height } = Dimensions.get('window')
const HEADER_MAX_HEIGHT = 220
const HEADER_MIN_HEIGHT = 60

interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  status: 'online' | 'offline' | 'busy' | 'away'
}

interface Project {
  id: string
  title: string
  progress: number
  tasksTotal: number
  tasksCompleted: number
}

interface Team {
  id: string
  name: string
  description: string
  members: TeamMember[]
  leadId: string
  projects: Project[]
  createdAt: string
}

const TeamDetailsScreen = ({ navigation, route }) => {
  const { teamId } = route.params || {}
  const [team, setTeam] = useState<Team | null>(null)
  const [activeTab, setActiveTab] = useState('members')
  const insets = useSafeAreaInsets()
  
  // Animated values
  const scrollY = useSharedValue(0)
  const headerHeight = useSharedValue(HEADER_MAX_HEIGHT)
  const headerOpacity = useSharedValue(1)
  const headerTitleOpacity = useSharedValue(0)
  
  // Load team data
  useEffect(() => {
    // Simulate data loading
    const mockTeam: Team = {
      id: 'team-001',
      name: 'Design Team',
      description: 'Responsible for user experience, user interface design, and visual assets for all company products.',
      members: [
        {
          id: 'user-001',
          name: 'Alex Johnson',
          role: 'Lead Designer',
          status: 'online'
        },
        {
          id: 'user-002',
          name: 'Morgan Smith',
          role: 'UI Designer',
          status: 'online'
        },
        {
          id: 'user-003',
          name: 'Jamie Parker',
          role: 'UX Researcher',
          status: 'busy'
        },
        {
          id: 'user-004',
          name: 'Taylor Reed',
          role: 'Visual Designer',
          status: 'away'
        },
        {
          id: 'user-005',
          name: 'Robin Chen',
          role: 'Motion Designer',
          status: 'offline'
        }
      ],
      leadId: 'user-001',
      projects: [
        {
          id: 'proj-001',
          title: 'Mobile App Redesign',
          progress: 0.7,
          tasksTotal: 24,
          tasksCompleted: 17
        },
        {
          id: 'proj-002',
          title: 'Website Refresh',
          progress: 0.4,
          tasksTotal: 18,
          tasksCompleted: 7
        },
        {
          id: 'proj-003',
          title: 'Design System',
          progress: 0.9,
          tasksTotal: 30,
          tasksCompleted: 27
        }
      ],
      createdAt: '2023-05-10T00:00:00.000Z'
    }
    
    setTeam(mockTeam)
  }, [teamId])
  
  const handleBackPress = () => {
    triggerImpact()
    navigation.goBack()
  }
  
  const handleChangeTab = (tab: string) => {
    triggerImpact()
    setActiveTab(tab)
  }
  
  const handleMemberPress = (memberId: string) => {
    triggerImpact()
    navigation.navigate('ProfileScreen', { userId: memberId })
  }
  
  const handleProjectPress = (projectId: string) => {
    triggerImpact()
    navigation.navigate('ProjectDetails', { projectId })
  }
  
  const handleChatPress = () => {
    triggerImpact()
    navigation.navigate('ChatScreen', { 
      chatId: teamId, 
      chatName: team?.name, 
      groupChat: true 
    })
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
      
      // Calculate header opacity
      if (offsetY > 80) {
        headerOpacity.value = Math.max(0, 1 - ((offsetY - 80) / 80))
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
  
  // Get team leader from members array
  const getTeamLead = () => {
    if (!team) return null
    return team.members.find(member => member.id === team.leadId)
  }
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  
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
            scrollY.value,
            [0, 80],
            [0, -20],
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
  
  // Render member item
  const renderMemberItem = ({ item, index }: { item: TeamMember, index: number }) => (
    <Animated.View 
      entering={SlideInRight.delay(index * 100).duration(300)}
    >
      <TouchableOpacity 
        style={styles.memberItem}
        onPress={() => handleMemberPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.memberAvatarContainer}>
          <Avatar 
            name={item.name}
            imageUrl={item.avatar}
            size={50}
            status={item.status}
          />
        </View>
        
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberRole}>{item.role}</Text>
        </View>
        
        <View style={styles.memberActions}>
          {item.id === team?.leadId && (
            <View style={styles.leaderBadge}>
              <Text style={styles.leaderBadgeText}>Team Lead</Text>
            </View>
          )}
          <Feather name="chevron-right" size={20} color={Colors.neutrals.gray400} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
  
  // Render project item
  const renderProjectItem = ({ item, index }: { item: Project, index: number }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 100).duration(300)}
    >
      <TouchableOpacity 
        style={styles.projectItem}
        onPress={() => handleProjectPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <Text style={styles.projectProgress}>{Math.round(item.progress * 100)}%</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarTrack}>
            <View 
              style={[
                styles.progressBarFill,
                { width: `${item.progress * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.projectFooter}>
          <Text style={styles.projectTasks}>
            {item.tasksCompleted}/{item.tasksTotal} tasks completed
          </Text>
          <Feather name="chevron-right" size={18} color={Colors.neutrals.gray400} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
  
  if (!team) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.blue} />
      </View>
    )
  }
  
  const teamLead = getTeamLead()
  
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Scrollable Content */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Spacer */}
        <View style={{ height: HEADER_MAX_HEIGHT }} />
        
        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Team Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>{team.description}</Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Feather name="calendar" size={16} color={Colors.neutrals.gray600} />
                <Text style={styles.metaText}>Created {formatDate(team.createdAt)}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Feather name="users" size={16} color={Colors.neutrals.gray600} />
                <Text style={styles.metaText}>{team.members.length} Members</Text>
              </View>
            </View>
          </View>
          
          {/* Tabs Navigation */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'members' && styles.activeTab
              ]}
              onPress={() => handleChangeTab('members')}
            >
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'members' && styles.activeTabText
                ]}
              >
                Members
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'projects' && styles.activeTab
              ]}
              onPress={() => handleChangeTab('projects')}
            >
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'projects' && styles.activeTabText
                ]}
              >
                Projects
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'members' && (
              <View style={styles.membersContainer}>
                <FlatList
                  data={team.members}
                  renderItem={renderMemberItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.membersList}
                />
                
                <TouchableOpacity style={styles.addButton}>
                  <Feather name="plus" size={20} color={Colors.primary.blue} />
                  <Text style={styles.addButtonText}>Invite Member</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {activeTab === 'projects' && (
              <View style={styles.projectsContainer}>
                <FlatList
                  data={team.projects}
                  renderItem={renderProjectItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.projectsList}
                />
                
                <TouchableOpacity style={styles.addButton}>
                  <Feather name="plus" size={20} color={Colors.primary.blue} />
                  <Text style={styles.addButtonText}>New Project</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Bottom Padding */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>
      
      {/* Header (Fixed position) */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <LinearGradient
          colors={[Colors.primary.blue, Colors.primary.darkBlue]}
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
          {team.name}
        </Animated.Text>
        
        {/* Header Content */}
        <Animated.View style={[styles.headerContent, headerContentStyle]}>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{team.name}</Text>
            
            <View style={styles.teamLeaderInfo}>
              <Text style={styles.teamLeaderLabel}>Lead by </Text>
              <Text style={styles.teamLeaderName}>{teamLead?.name}</Text>
            </View>
            
            <View style={styles.membersPreview}>
              <AvatarStack
                users={team.members.map(m => ({ 
                  id: m.id, 
                  name: m.name, 
                  imageUrl: m.avatar 
                }))}
                maxDisplay={5}
                size={32}
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
      
      {/* Chat Button (Fixed position) */}
      <TouchableOpacity 
        style={[styles.chatButton, { bottom: insets.bottom + 16 }]}
        onPress={handleChatPress}
      >
        <LinearGradient
          colors={[Colors.primary.blue, Colors.primary.darkBlue]}
          style={styles.chatButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="message-circle" size={24} color={Colors.neutrals.white} />
          <Text style={styles.chatButtonText}>Team Chat</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
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
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingHorizontal: 20
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
  teamInfo: {
    alignItems: 'center'
  },
  teamName: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginBottom: 4
  },
  teamLeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  teamLeaderLabel: {
    fontSize: Typography.sizes.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)'
  },
  teamLeaderName: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white
  },
  membersPreview: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  contentContainer: {
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24
  },
  descriptionContainer: {
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
  descriptionText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray700,
    lineHeight: 22,
    marginBottom: 16
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.neutrals.gray200,
    paddingTop: 16
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24
  },
  metaText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginLeft: 8
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16
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
    flex: 1
  },
  membersContainer: {
    marginBottom: 24
  },
  membersList: {
    marginBottom: 16
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  memberAvatarContainer: {
    marginRight: 16
  },
  memberInfo: {
    flex: 1
  },
  memberName: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 4
  },
  memberRole: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  leaderBadge: {
    backgroundColor: Colors.primary.blue + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8
  },
  leaderBadgeText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: Colors.primary.blue
  },
  projectsContainer: {
    marginBottom: 24
  },
  projectsList: {
    marginBottom: 16
  },
  projectItem: {
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  projectTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900
  },
  projectProgress: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary.blue
  },
  progressBarContainer: {
    marginBottom: 12
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 3
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.blue,
    borderRadius: 3
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  projectTasks: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primary.blue,
    borderRadius: 12,
    borderStyle: 'dashed'
  },
  addButtonText: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium,
    marginLeft: 8
  },
  chatButton: {
    position: 'absolute',
    right: 20,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6
  },
  chatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 20
  },
  chatButtonText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white,
    marginLeft: 8
  }
})

export default TeamDetailsScreen