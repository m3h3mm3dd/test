import React, { useState, useEffect, useRef } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  StatusBar,
  Dimensions,
  SafeAreaView
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  SlideInUp,
  ZoomIn,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { BlurView } from 'expo-blur'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import AvatarStack from '../components/Avatar/AvatarStack'
import FAB from '../components/FAB'
import { triggerImpact } from '../utils/HapticUtils'

const { width, height } = Dimensions.get('window')
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

interface Team {
  id: string
  name: string
  description: string
  members: {
    id: string
    name: string
    avatar?: string
  }[]
  tasksCount: number
  projectsCount: number
  activeProjects: boolean
  isNew?: boolean
}

const TeamsListScreen = ({ navigation }) => {
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  
  // Animated values
  const searchBarWidth = useSharedValue(width - 80)
  const filterHeight = useSharedValue(0)
  const filterOpacity = useSharedValue(0)
  const scrollY = useSharedValue(0)
  const headerOpacity = useSharedValue(1)
  
  // Load teams data
  useEffect(() => {
    // Simulate data loading delay
    setTimeout(() => {
      // Mock data
      const mockTeams: Team[] = [
        {
          id: 'team-001',
          name: 'Design Team',
          description: 'User experience and interface design',
          members: [
            { id: 'user-001', name: 'Alex Johnson' },
            { id: 'user-002', name: 'Morgan Smith' },
            { id: 'user-003', name: 'Jamie Parker' },
            { id: 'user-004', name: 'Taylor Reed' },
            { id: 'user-005', name: 'Robin Chen' }
          ],
          tasksCount: 42,
          projectsCount: 3,
          activeProjects: true
        },
        {
          id: 'team-002',
          name: 'Development Team',
          description: 'Frontend and backend development',
          members: [
            { id: 'user-006', name: 'Casey Williams' },
            { id: 'user-007', name: 'Jordan Lee' },
            { id: 'user-008', name: 'Riley Thompson' },
            { id: 'user-009', name: 'Avery Martinez' }
          ],
          tasksCount: 56,
          projectsCount: 4,
          activeProjects: true
        },
        {
          id: 'team-003',
          name: 'Marketing Team',
          description: 'Brand strategy and campaign management',
          members: [
            { id: 'user-010', name: 'Quinn Foster' },
            { id: 'user-011', name: 'Blake Rogers' },
            { id: 'user-012', name: 'Drew Nelson' }
          ],
          tasksCount: 27,
          projectsCount: 2,
          activeProjects: true
        },
        {
          id: 'team-004',
          name: 'Data Science Team',
          description: 'Analytics and machine learning',
          members: [
            { id: 'user-013', name: 'Jordan Patel' },
            { id: 'user-014', name: 'Sam Wilson' }
          ],
          tasksCount: 13,
          projectsCount: 1,
          activeProjects: false
        },
        {
          id: 'team-005',
          name: 'Quality Assurance',
          description: 'Testing and quality control',
          members: [
            { id: 'user-015', name: 'Charlie Kim' },
            { id: 'user-016', name: 'Alex Rodriguez' },
            { id: 'user-017', name: 'Pat Johnson' }
          ],
          tasksCount: 31,
          projectsCount: 2,
          activeProjects: true
        }
      ]
      
      setTeams(mockTeams)
      setFilteredTeams(mockTeams)
      setIsLoading(false)
    }, 1000)
  }, [])
  
  // Filter teams based on search query and active filter
  useEffect(() => {
    let result = [...teams]
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(team => 
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply tab filter
    switch (activeFilter) {
      case 'active':
        result = result.filter(team => team.activeProjects)
        break
      case 'my':
        // In a real app, this would filter teams the current user is part of
        result = result.filter((_, index) => index % 2 === 0) // Simulating "my teams"
        break
    }
    
    setFilteredTeams(result)
  }, [searchQuery, teams, activeFilter])
  
  const handleSearchChange = (text: string) => {
    setSearchQuery(text)
  }
  
  const handleFilterPress = () => {
    triggerImpact()
    setShowFilters(!showFilters)
    
    if (!showFilters) {
      // Show filters
      filterHeight.value = withTiming(50, { duration: 300 })
      filterOpacity.value = withTiming(1, { duration: 300 })
    } else {
      // Hide filters
      filterHeight.value = withTiming(0, { duration: 300 })
      filterOpacity.value = withTiming(0, { duration: 300 })
    }
  }
  
  const handleFilterSelect = (filter: string) => {
    triggerImpact()
    setActiveFilter(filter)
  }
  
  const handleTeamPress = (teamId: string) => {
    triggerImpact()
    navigation.navigate('TeamDetails', { teamId })
  }
  
  const handleCreateTeam = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    navigation.navigate('CreateTeam')
  }
  
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y
    scrollY.value = offsetY
    
    // Fade out header on scroll
    if (offsetY > 20) {
      headerOpacity.value = withTiming(0.8, { duration: 200 })
      searchBarWidth.value = withTiming(width - 32, { duration: 200 })
    } else {
      headerOpacity.value = withTiming(1, { duration: 200 })
      searchBarWidth.value = withTiming(width - 80, { duration: 200 })
    }
  }
  
  // Render team item
  const renderTeamItem = ({ item, index }) => (
    <Animated.View
      entering={SlideInUp.delay(index * 100).duration(400)}
      style={item.isNew && styles.newTeamHighlight}
    >
      <TouchableOpacity
        style={styles.teamCard}
        onPress={() => handleTeamPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.teamCardHeader}>
          <View>
            <Text style={styles.teamName}>{item.name}</Text>
            <Text style={styles.teamDescription}>{item.description}</Text>
          </View>
          
          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>
        
        <View style={styles.teamCardContent}>
          <View style={styles.membersSection}>
            <AvatarStack
              users={item.members}
              size={32}
              maxDisplay={4}
            />
            <Text style={styles.membersCount}>{item.members.length} members</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.tasksCount}</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.projectsCount}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <View 
                style={[
                  styles.statusIndicator,
                  { backgroundColor: item.activeProjects ? Colors.status.success : Colors.neutrals.gray400 }
                ]} 
              />
              <Text style={styles.statLabel}>
                {item.activeProjects ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value
    }
  })
  
  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: searchBarWidth.value
    }
  })
  
  const filterContainerStyle = useAnimatedStyle(() => {
    return {
      height: filterHeight.value,
      opacity: filterOpacity.value
    }
  })
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
      
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Text style={styles.title}>Teams</Text>
        
        <View style={styles.searchContainer}>
          <Animated.View style={[styles.searchBar, searchBarAnimatedStyle]}>
            <Feather name="search" size={18} color={Colors.neutrals.gray500} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search teams..."
              placeholderTextColor={Colors.neutrals.gray500}
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Feather name="x" size={18} color={Colors.neutrals.gray500} />
              </TouchableOpacity>
            )}
          </Animated.View>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              showFilters && styles.filterButtonActive
            ]}
            onPress={handleFilterPress}
          >
            <Feather 
              name="filter" 
              size={20} 
              color={showFilters ? Colors.primary.blue : Colors.neutrals.gray700} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Filter Tabs */}
        <Animated.View 
          style={[styles.filterContainer, filterContainerStyle]}
        >
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[
                styles.filterTab,
                activeFilter === 'all' && styles.activeFilterTab
              ]}
              onPress={() => handleFilterSelect('all')}
            >
              <Text 
                style={[
                  styles.filterTabText,
                  activeFilter === 'all' && styles.activeFilterTabText
                ]}
              >
                All Teams
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterTab,
                activeFilter === 'my' && styles.activeFilterTab
              ]}
              onPress={() => handleFilterSelect('my')}
            >
              <Text 
                style={[
                  styles.filterTabText,
                  activeFilter === 'my' && styles.activeFilterTabText
                ]}
              >
                My Teams
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterTab,
                activeFilter === 'active' && styles.activeFilterTab
              ]}
              onPress={() => handleFilterSelect('active')}
            >
              <Text 
                style={[
                  styles.filterTabText,
                  activeFilter === 'active' && styles.activeFilterTabText
                ]}
              >
                Active
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Animated.View>
      
      {/* Teams List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonHeader}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonDescription} />
            </View>
            <View style={styles.skeletonAvatars} />
            <View style={styles.skeletonStats} />
          </View>
          
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonHeader}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonDescription} />
            </View>
            <View style={styles.skeletonAvatars} />
            <View style={styles.skeletonStats} />
          </View>
          
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonHeader}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonDescription} />
            </View>
            <View style={styles.skeletonAvatars} />
            <View style={styles.skeletonStats} />
          </View>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredTeams}
            renderItem={renderTeamItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.teamsList}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Animated.View 
                  style={styles.emptyIconContainer}
                  entering={ZoomIn.duration(400)}
                >
                  <Feather name="users" size={48} color={Colors.neutrals.gray400} />
                </Animated.View>
                <Text style={styles.emptyTitle}>No teams found</Text>
                <Text style={styles.emptyMessage}>
                  {searchQuery 
                    ? "No teams match your search criteria"
                    : "You don't have any teams yet. Create a new team to get started."
                  }
                </Text>
                
                {!searchQuery && (
                  <TouchableOpacity 
                    style={styles.createEmptyButton}
                    onPress={handleCreateTeam}
                  >
                    <Text style={styles.createEmptyButtonText}>Create Team</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
          
          <FAB
            icon="plus"
            onPress={handleCreateTeam}
            position="bottomRight"
          />
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  title: {
    fontSize: Typography.sizes.header,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginBottom: 16
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.gray100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 44
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray900,
    marginLeft: 10
  },
  clearButton: {
    padding: 4
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.neutrals.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12
  },
  filterButtonActive: {
    backgroundColor: Colors.primary.blue + '20'
  },
  filterContainer: {
    overflow: 'hidden'
  },
  filterContent: {
    paddingVertical: 8
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutrals.gray100,
    marginRight: 8
  },
  activeFilterTab: {
    backgroundColor: Colors.primary.blue + '20'
  },
  filterTabText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray700
  },
  activeFilterTabText: {
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium
  },
  loadingContainer: {
    flex: 1,
    padding: 20
  },
  skeletonCard: {
    backgroundColor: Colors.neutrals.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  skeletonHeader: {
    marginBottom: 16
  },
  skeletonTitle: {
    width: '60%',
    height: 24,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 4,
    marginBottom: 8
  },
  skeletonDescription: {
    width: '80%',
    height: 16,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 4
  },
  skeletonAvatars: {
    width: '40%',
    height: 40,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 20,
    marginBottom: 16
  },
  skeletonStats: {
    height: 40,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 8
  },
  teamsList: {
    padding: 20,
    paddingBottom: 100
  },
  teamCard: {
    backgroundColor: Colors.neutrals.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  teamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  teamName: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 4
  },
  teamDescription: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600
  },
  newBadge: {
    backgroundColor: Colors.primary.blue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  newBadgeText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white
  },
  teamCardContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutrals.gray200,
    paddingTop: 16
  },
  membersSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  membersCount: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginLeft: 12
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutrals.gray100,
    borderRadius: 12,
    padding: 12
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.neutrals.gray300
  },
  statValue: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 2
  },
  statLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4
  },
  newTeamHighlight: {
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8
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
    lineHeight: 22,
    marginBottom: 24
  },
  createEmptyButton: {
    backgroundColor: Colors.primary.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12
  },
  createEmptyButtonText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white
  }
})

export default TeamsListScreen