import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Dimensions,
  FlatList,
  ActivityIndicator,
  Platform
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  withSpring,
  withDelay,
  FadeIn,
  SlideInRight,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import Spacing from '../theme/Spacing';
import Avatar from '../components/Avatar/Avatar';
import AvatarStack from '../components/Avatar/AvatarStack';
import Card from '../components/Card';
import Button from '../components/Button/Button';
import StatusPill from '../components/StatusPill';
import { useTheme } from '../hooks/useColorScheme';
import { triggerImpact } from '../utils/HapticUtils';
import { formatDateString } from '../utils/helpers';

const { width, height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 240;
const HEADER_MIN_HEIGHT = 70;
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy' | 'away';
}

interface Project {
  id: string;
  title: string;
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
  dueDate: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  leadId: string;
  projects: Project[];
  createdAt: string;
}

const TeamDetailsScreen = ({ navigation, route }) => {
  const { teamId } = route.params || {};
  const [team, setTeam] = useState<Team | null>(null);
  const [activeTab, setActiveTab] = useState('members');
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  
  // Animated values
  const scrollY = useSharedValue(0);
  const headerHeight = useSharedValue(HEADER_MAX_HEIGHT);
  const headerOpacity = useSharedValue(1);
  const headerTitleOpacity = useSharedValue(0);
  const fabScale = useSharedValue(1);
  
  // Load team data
  useEffect(() => {
    // Configure status bar
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
    
    // Simulate data loading with a slight delay
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock team data
      const mockTeam: Team = {
        id: 'team-001',
        name: 'Design Team',
        description: 'Responsible for user experience, user interface design, and visual assets for all company products. Our mission is to create intuitive and delightful experiences that meet user needs while supporting business goals.',
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
            tasksCompleted: 17,
            dueDate: '2025-06-15T00:00:00.000Z'
          },
          {
            id: 'proj-002',
            title: 'Website Refresh',
            progress: 0.4,
            tasksTotal: 18,
            tasksCompleted: 7,
            dueDate: '2025-07-01T00:00:00.000Z'
          },
          {
            id: 'proj-003',
            title: 'Design System',
            progress: 0.9,
            tasksTotal: 30,
            tasksCompleted: 27,
            dueDate: '2025-05-20T00:00:00.000Z'
          }
        ],
        createdAt: '2023-05-10T00:00:00.000Z'
      };
      
      setTeam(mockTeam);
      setIsLoading(false);
    };
    
    loadData();
    
    // Cleanup status bar
    return () => {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(isDark ? colors.background.dark : colors.background.light);
        StatusBar.setTranslucent(false);
      }
    };
  }, [teamId]);
  
  const handleBackPress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };
  
  const handleChangeTab = (tab: string) => {
    if (tab === activeTab) return;
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };
  
  const handleMemberPress = (memberId: string) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ProfileScreen', { userId: memberId });
  };
  
  const handleProjectPress = (projectId: string) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ProjectDetails', { projectId });
  };
  
  const handleChatPress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    // Show button press animation
    fabScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );
    navigation.navigate('ChatScreen', { 
      chatId: teamId, 
      chatName: team?.name, 
      groupChat: true 
    });
  };
  
  const handleInvitePress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    // Show team invite dialog or navigate to invite screen
    navigation.navigate('InviteMembers', { teamId });
  };
  
  const handleNewProjectPress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to create project screen
    navigation.navigate('CreateProject', { teamId });
  };
  
  // Scroll handler for animations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offsetY = event.contentOffset.y;
      scrollY.value = offsetY;
      
      // Calculate header height based on scroll position
      const newHeaderHeight = Math.max(
        HEADER_MIN_HEIGHT,
        HEADER_MAX_HEIGHT - offsetY
      );
      headerHeight.value = newHeaderHeight;
      
      // Calculate header opacity
      if (offsetY > 80) {
        headerOpacity.value = Math.max(0, 1 - ((offsetY - 80) / 80));
      } else {
        headerOpacity.value = 1;
      }
      
      // Show/hide header title
      if (offsetY > HEADER_MAX_HEIGHT - 100) {
        headerTitleOpacity.value = Math.min(1, (offsetY - (HEADER_MAX_HEIGHT - 100)) / 50);
      } else {
        headerTitleOpacity.value = 0;
      }
    }
  });
  
  // Get team leader from members array
  const getTeamLead = () => {
    if (!team) return null;
    return team.members.find(member => member.id === team.leadId);
  };
  
  // Get formatted dates
  const getFormattedDate = (dateString: string) => {
    return formatDateString(dateString, { month: 'long', year: 'numeric' });
  };
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value
    };
  });
  
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
    };
  });
  
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
    };
  });
  
  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: fabScale.value }]
    };
  });
  
  // Render member item
  const renderMemberItem = ({ item, index }: { item: TeamMember; index: number }) => (
    <Animated.View 
      entering={SlideInRight.delay(index * 100).duration(300)}
    >
      <Card 
        style={styles.memberItem}
        onPress={() => handleMemberPress(item.id)}
        animationType="spring"
        index={index}
      >
        <View style={styles.memberContent}>
          <View style={styles.memberAvatarContainer}>
            <Avatar 
              name={item.name}
              imageUrl={item.avatar}
              size={50}
              status={item.status}
            />
          </View>
          
          <View style={styles.memberInfo}>
            <Text style={[styles.memberName, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
              {item.name}
            </Text>
            <Text style={[styles.memberRole, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
              {item.role}
            </Text>
          </View>
          
          <View style={styles.memberActions}>
            {item.id === team?.leadId && (
              <View style={styles.leaderBadge}>
                <Text style={styles.leaderBadgeText}>Team Lead</Text>
              </View>
            )}
            <Feather name="chevron-right" size={20} color={isDark ? colors.text.secondary : Colors.neutrals.gray400} />
          </View>
        </View>
      </Card>
    </Animated.View>
  );
  
  // Render project item
  const renderProjectItem = ({ item, index }: { item: Project; index: number }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 100).duration(300)}
    >
      <Card 
        style={styles.projectItem}
        onPress={() => handleProjectPress(item.id)}
        animationType="spring"
        index={index}
      >
        <View style={styles.projectHeader}>
          <Text style={[styles.projectTitle, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
            {item.title}
          </Text>
          <StatusPill 
            label={`${Math.round(item.progress * 100)}%`}
            type={item.progress === 1 ? 'completed' : item.progress > 0.6 ? 'in-progress' : 'pending'}
            small
          />
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.neutrals.gray200 }]}>
            <View 
              style={[
                styles.progressBarFill,
                { 
                  width: `${item.progress * 100}%`,
                  backgroundColor: getProgressColor(item.progress)
                }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.projectFooter}>
          <View style={styles.projectStats}>
            <Text style={[styles.projectTasks, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
              {item.tasksCompleted}/{item.tasksTotal} tasks
            </Text>
            <View style={styles.projectDueDate}>
              <Feather name="calendar" size={14} color={isDark ? colors.text.secondary : Colors.neutrals.gray600} style={styles.projectDueDateIcon} />
              <Text style={[styles.projectDueDateText, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
                Due {formatDateString(item.dueDate)}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={isDark ? colors.text.secondary : Colors.neutrals.gray400} />
        </View>
      </Card>
    </Animated.View>
  );
  
  // Helper function to get progress color
  const getProgressColor = (progress: number) => {
    if (progress >= 0.9) return Colors.success[500];
    if (progress >= 0.4) return Colors.primary.blue;
    return Colors.warning[500];
  };
  
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? colors.background.dark : Colors.background.light }]}>
        <ActivityIndicator size="large" color={Colors.primary.blue} />
        <Text style={[styles.loadingText, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
          Loading team details...
        </Text>
      </View>
    );
  }
  
  if (!team) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: isDark ? colors.background.dark : Colors.background.light }]}>
        <Feather name="alert-circle" size={48} color={Colors.error[500]} />
        <Text style={[styles.errorTitle, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
          Team Not Found
        </Text>
        <Text style={[styles.errorMessage, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
          We couldn't find the team you're looking for. It may have been deleted or you don't have access.
        </Text>
        <Button
          title="Go Back"
          onPress={handleBackPress}
          variant="primary"
          size="medium"
          style={styles.errorButton}
        />
      </View>
    );
  }
  
  const teamLead = getTeamLead();
  
  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background.dark : Colors.background.light }]}>
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
        <View style={[styles.contentContainer, { backgroundColor: isDark ? colors.background.dark : Colors.background.light }]}>
          {/* Team Description */}
          <Card style={styles.descriptionContainer}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>About</Text>
            <Text style={[styles.descriptionText, { color: isDark ? colors.text.primary : Colors.neutrals.gray700 }]}>
              {team.description}
            </Text>
            
            <View style={[styles.metaContainer, { borderTopColor: isDark ? colors.border : Colors.neutrals.gray200 }]}>
              <View style={styles.metaItem}>
                <Feather name="calendar" size={16} color={isDark ? colors.text.secondary : Colors.neutrals.gray600} />
                <Text style={[styles.metaText, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
                  Created {getFormattedDate(team.createdAt)}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Feather name="users" size={16} color={isDark ? colors.text.secondary : Colors.neutrals.gray600} />
                <Text style={[styles.metaText, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
                  {team.members.length} Members
                </Text>
              </View>
            </View>
          </Card>
          
          {/* Tabs Navigation */}
          <View style={[styles.tabsContainer, { borderBottomColor: isDark ? colors.border : Colors.neutrals.gray200 }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'members' && [styles.activeTab, { borderBottomColor: Colors.primary.blue }]
              ]}
              onPress={() => handleChangeTab('members')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'members' }}
              accessibilityLabel="Members tab"
            >
              <Text 
                style={[
                  styles.tabText,
                  { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 },
                  activeTab === 'members' && [styles.activeTabText, { color: Colors.primary.blue }]
                ]}
              >
                Members
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'projects' && [styles.activeTab, { borderBottomColor: Colors.primary.blue }]
              ]}
              onPress={() => handleChangeTab('projects')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'projects' }}
              accessibilityLabel="Projects tab"
            >
              <Text 
                style={[
                  styles.tabText,
                  { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 },
                  activeTab === 'projects' && [styles.activeTabText, { color: Colors.primary.blue }]
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
                  contentContainerStyle={styles.listContainer}
                />
                
                <Button
                  title="Invite Member"
                  onPress={handleInvitePress}
                  variant="secondary"
                  size="medium"
                  icon="user-plus"
                  style={styles.addButton}
                />
              </View>
            )}
            
            {activeTab === 'projects' && (
              <View style={styles.projectsContainer}>
                <FlatList
                  data={team.projects}
                  renderItem={renderProjectItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.listContainer}
                />
                
                <Button
                  title="New Project"
                  onPress={handleNewProjectPress}
                  variant="secondary"
                  size="medium"
                  icon="plus"
                  style={styles.addButton}
                />
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
          colors={[Colors.primary[600], Colors.primary[700], Colors.primary[800]]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Blur overlay for header when scrolled */}
        <AnimatedBlurView
          intensity={20}
          tint="dark"
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: interpolate(
                headerTitleOpacity.value,
                [0, 1],
                [0, 1],
                Extrapolation.CLAMP
              )
            }
          ]}
        />
        
        {/* Back Button */}
        <TouchableOpacity 
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={handleBackPress}
          accessibilityRole="button"
          accessibilityLabel="Go back"
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
          numberOfLines={1}
        >
          {team.name}
        </Animated.Text>
        
        {/* Header Content */}
        <Animated.View style={[styles.headerContent, headerContentStyle, { paddingTop: insets.top + 50 }]}>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName} numberOfLines={1}>{team.name}</Text>
            
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
                size={36}
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
      
      {/* Chat Button (Fixed position) */}
      <Animated.View 
        style={[
          styles.chatButtonContainer, 
          { bottom: insets.bottom + 16 },
          fabAnimatedStyle
        ]}
      >
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={handleChatPress}
          accessibilityRole="button"
          accessibilityLabel="Open team chat"
        >
          <LinearGradient
            colors={[Colors.primary[500], Colors.primary[700]]}
            style={styles.chatButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="message-circle" size={24} color={Colors.neutrals.white} />
            <Text style={styles.chatButtonText}>Team Chat</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

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
  loadingText: {
    marginTop: 16,
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray600
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    padding: 24
  },
  errorTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginTop: 16,
    marginBottom: 8
  },
  errorMessage: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray600,
    textAlign: 'center',
    marginBottom: 24
  },
  errorButton: {
    minWidth: 160
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
    justifyContent: 'flex-end',
    paddingBottom: 24,
    paddingHorizontal: 20
  },
  headerTitle: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white,
    maxWidth: width - 120
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 20,
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
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  teamLeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
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
    padding: 20,
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 12
  },
  descriptionText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray700,
    lineHeight: 24,
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
  projectsContainer: {
    marginBottom: 24
  },
  listContainer: {
    marginBottom: 16
  },
  memberItem: {
    marginBottom: 12
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center'
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
  projectItem: {
    marginBottom: 12
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
    color: Colors.neutrals.gray900,
    flex: 1,
    marginRight: 8
  },
  progressBarContainer: {
    marginBottom: 16
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
  projectStats: {
    flex: 1
  },
  projectTasks: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginBottom: 4
  },
  projectDueDate: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  projectDueDateIcon: {
    marginRight: 4
  },
  projectDueDateText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  addButton: {
    marginVertical: 8
  },
  chatButtonContainer: {
    position: 'absolute',
    right: 20,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 5
  },
  chatButton: {
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden'
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
});

export default TeamDetailsScreen;