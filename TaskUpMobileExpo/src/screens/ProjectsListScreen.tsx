import React, { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl,
  ActivityIndicator
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  FadeInDown,
  Layout
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { SharedElement } from 'react-navigation-shared-element'
import * as Haptics from 'expo-haptics'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import Card from '../components/Card'
import FAB from '../components/FAB'
import SegmentedControl from '../components/Controls/SegmentedControl'
import AvatarStack from '../components/Avatar/AvatarStack'
import SkeletonLoader from '../components/SkeletonLoader'
import { triggerImpact } from '../utils/HapticUtils'

const { width } = Dimensions.get('window')
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

// Project data structure
interface Project {
  id: string
  title: string
  description: string
  tasksTotal: number
  tasksCompleted: number
  progress: number
  dueDate: string
  team: Array<{ id: string, name: string, imageUrl?: string | null }>
  color: string
  icon: keyof typeof Feather.glyphMap
}

// Project view mode
type ViewMode = 'grid' | 'list'

// Filters options
const FILTER_OPTIONS = [
  { id: 'all', label: 'All Projects' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' }
]

const ProjectsListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  
  // State
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [activeFilter, setActiveFilter] = useState('all')
  
  // Animation values
  const headerHeight = useSharedValue(150)
  const scrollY = useSharedValue(0)
  const fabScale = useSharedValue(1)
  
  // Load projects data
  useEffect(() => {
    fetchProjects()
  }, [])
  
  // Simulated API call to fetch projects
  const fetchProjects = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Sample data
    const projectsData: Project[] = [
      {
        id: '1',
        title: 'Mobile App Redesign',
        description: 'Redesign the mobile app UI/UX with new brand guidelines',
        tasksTotal: 12,
        tasksCompleted: 8,
        progress: 0.67,
        dueDate: '2025-05-15',
        team: [
          { id: '1', name: 'Alex Johnson', imageUrl: null },
          { id: '2', name: 'Morgan Smith', imageUrl: null },
          { id: '3', name: 'Jamie Parker', imageUrl: null }
        ],
        color: Colors.primary.blue,
        icon: 'smartphone'
      },
      {
        id: '2',
        title: 'Website Development',
        description: 'Build new company website with the new design system',
        tasksTotal: 18,
        tasksCompleted: 12,
        progress: 0.67,
        dueDate: '2025-06-10',
        team: [
          { id: '1', name: 'Alex Johnson', imageUrl: null },
          { id: '4', name: 'Taylor Reed', imageUrl: null }
        ],
        color: Colors.secondary.green,
        icon: 'globe'
      },
      {
        id: '3',
        title: 'Marketing Campaign',
        description: 'Q2 digital marketing campaign for product launch',
        tasksTotal: 8,
        tasksCompleted: 3,
        progress: 0.38,
        dueDate: '2025-05-30',
        team: [
          { id: '2', name: 'Morgan Smith', imageUrl: null },
          { id: '5', name: 'Jordan Casey', imageUrl: null }
        ],
        color: '#9C27B0',
        icon: 'trending-up'
      },
      {
        id: '4',
        title: 'Product Research',
        description: 'Market research for new product features',
        tasksTotal: 6,
        tasksCompleted: 6,
        progress: 1.0,
        dueDate: '2025-04-20',
        team: [
          { id: '1', name: 'Alex Johnson', imageUrl: null },
          { id: '3', name: 'Jamie Parker', imageUrl: null }
        ],
        color: '#FF9800',
        icon: 'search'
      },
      {
        id: '5',
        title: 'Backend Infrastructure',
        description: 'Upgrade backend services and API endpoints',
        tasksTotal: 14,
        tasksCompleted: 5,
        progress: 0.36,
        dueDate: '2025-07-15',
        team: [
          { id: '4', name: 'Taylor Reed', imageUrl: null },
          { id: '6', name: 'Riley Morgan', imageUrl: null }
        ],
        color: '#795548',
        icon: 'server'
      },
      {
        id: '6',
        title: 'User Testing',
        description: 'Conduct user testing sessions for the new features',
        tasksTotal: 9,
        tasksCompleted: 4,
        progress: 0.44,
        dueDate: '2025-06-05',
        team: [
          { id: '2', name: 'Morgan Smith', imageUrl: null },
          { id: '3', name: 'Jamie Parker', imageUrl: null },
          { id: '5', name: 'Jordan Casey', imageUrl: null }
        ],
        color: '#607D8B',
        icon: 'users'
      }
    ]
    
    setProjects(projectsData)
    setLoading(false)
    setRefreshing(false)
  }
  
  // Filter projects based on active filter
  const filteredProjects = () => {
    if (activeFilter === 'all') {
      return projects
    } else if (activeFilter === 'active') {
      return projects.filter(p => p.progress < 1)
    } else {
      return projects.filter(p => p.progress === 1)
    }
  }
  
  // Handle refresh
  const handleRefresh = () => {
    fetchProjects(true)
  }
  
  // Toggle view mode between grid and list
  const toggleViewMode = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'))
    
    // Animate FAB
    fabScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1, { damping: 15 })
    )
  }
  
  // Navigate to project details
  const handleProjectPress = (project: Project) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    navigation.navigate('ProjectDetails', { projectId: project.id })
  }
  
  // Handle create new project
  const handleCreateProject = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    // Navigate to create project screen (not implemented in this example)
    console.log('Create project')
  }
  
  // Handle scroll for collapsing header
  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.y
    scrollY.value = scrollOffset
    
    // Collapse header on scroll
    const newHeight = Math.max(80, 150 - scrollOffset)
    headerHeight.value = withTiming(newHeight, { duration: 100 })
  }
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value
    }
  })
  
  const titleOpacityStyle = useAnimatedStyle(() => {
    const opacity = withTiming(headerHeight.value > 100 ? 1 : 0, { duration: 200 })
    return { opacity }
  })
  
  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: fabScale.value }]
    }
  })
  
  // Render list skeleton loaders
  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      {viewMode === 'grid' ? (
        <View style={styles.gridSkeletons}>
          {[1, 2, 3, 4].map(i => (
            <SkeletonLoader.Card 
              key={i}
              width={width / 2 - 24} 
              height={180}
              style={styles.gridSkeleton} 
            />
          ))}
        </View>
      ) : (
        <View>
          {[1, 2, 3].map(i => (
            <SkeletonLoader.Card 
              key={i}
              height={120}
              style={{ marginBottom: 16 }} 
            />
          ))}
        </View>
      )}
    </View>
  )
  
  // Render grid item
  const renderGridItem = ({ item, index }: { item: Project, index: number }) => (
    <Animated.View
      layout={Layout.springify()}
      entering={FadeInDown.delay(index * 100).duration(400)}
      style={styles.gridItemContainer}
    >
      <Card
        style={styles.gridCard}
        onPress={() => handleProjectPress(item)}
        animationType="tilt"
        elevation={3}
        sharedElementId={`project.${item.id}.card`}
      >
        <LinearGradient
          colors={[item.color, adjustColorBrightness(item.color, -20)]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={styles.gridCardContent}>
          <View style={styles.gridCardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Feather name={item.icon} size={20} color="#fff" />
            </View>
            
            <View style={styles.progressIndicator}>
              <View style={styles.progressTrack}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { width: `${item.progress * 100}%` }
                  ]}
                  entering={FadeInDown.delay((index * 100) + 300).duration(600)}
                />
              </View>
              <Text style={styles.progressText}>{`${Math.round(item.progress * 100)}%`}</Text>
            </View>
          </View>
          
          <SharedElement id={`project.${item.id}.title`}>
            <Text style={styles.gridCardTitle} numberOfLines={2}>{item.title}</Text>
          </SharedElement>
          
          <View style={styles.gridCardFooter}>
            <AvatarStack 
              users={item.team}
              maxDisplay={2}
              size={24}
            />
            
            <Text style={styles.gridCardMeta}>
              {item.tasksCompleted}/{item.tasksTotal} tasks
            </Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  )
  
  // Render list item
  const renderListItem = ({ item, index }: { item: Project, index: number }) => (
    <Animated.View
      layout={Layout.springify()}
      entering={FadeInDown.delay(index * 100).duration(400)}
      style={styles.listItemContainer}
    >
      <Card
        style={styles.listCard}
        onPress={() => handleProjectPress(item)}
        animationType="spring"
        elevation={3}
        sharedElementId={`project.${item.id}.card`}
      >
        <View style={styles.listCardContent}>
          <View style={styles.listCardLeft}>
            <View 
              style={[
                styles.listIconContainer, 
                { 
                  backgroundColor: adjustColorBrightness(item.color, 90) 
                }
              ]}
            >
              <Feather name={item.icon} size={24} color={item.color} />
            </View>
          </View>
          
          <View style={styles.listCardMiddle}>
            <SharedElement id={`project.${item.id}.title`}>
              <Text style={styles.listCardTitle} numberOfLines={1}>{item.title}</Text>
            </SharedElement>
            
            <Text style={styles.listCardDescription} numberOfLines={1}>
              {item.description}
            </Text>
            
            <View style={styles.listCardProgress}>
              <View style={styles.listProgressTrack}>
                <Animated.View 
                  style={[
                    styles.listProgressFill, 
                    { 
                      width: `${item.progress * 100}%`,
                      backgroundColor: item.color
                    }
                  ]}
                  entering={FadeInDown.delay((index * 100) + 300).duration(600)}
                />
              </View>
              <Text style={styles.listProgressText}>
                {item.tasksCompleted}/{item.tasksTotal} tasks
              </Text>
            </View>
          </View>
          
          <View style={styles.listCardRight}>
            <AvatarStack 
              users={item.team}
              maxDisplay={2}
              size={24}
            />
            
            <Feather name="chevron-right" size={18} color={Colors.neutrals.gray500} />
          </View>
        </View>
      </Card>
    </Animated.View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
      
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle, { paddingTop: insets.top }]}>
        <Animated.View style={[styles.titleContainer, titleOpacityStyle]}>
          <Text style={styles.title}>Projects</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.viewModeButton}
              onPress={toggleViewMode}
            >
              <Feather 
                name={viewMode === 'grid' ? 'list' : 'grid'} 
                size={20} 
                color={Colors.neutrals.gray700} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterButton}>
              <Feather name="filter" size={20} color={Colors.neutrals.gray700} />
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        <View style={styles.filterContainer}>
          <SegmentedControl
            segments={FILTER_OPTIONS}
            selectedId={activeFilter}
            onChange={setActiveFilter}
          />
        </View>
      </Animated.View>
      
      {/* Projects List */}
      {loading ? (
        renderSkeletons()
      ) : (
        <AnimatedFlatList
          data={filteredProjects()}
          keyExtractor={item => item.id}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          numColumns={viewMode === 'grid' ? 2 : 1}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: headerHeight.value + 16 }
          ]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary.blue}
              colors={[Colors.primary.blue]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="folder" size={60} color={Colors.neutrals.gray300} />
              <Text style={styles.emptyTitle}>No Projects Found</Text>
              <Text style={styles.emptyText}>
                {activeFilter === 'all' 
                  ? 'You have no projects yet. Create your first project!'
                  : `No ${activeFilter} projects found.`
                }
              </Text>
            </View>
          }
        />
      )}
      
      {/* FAB */}
      <Animated.View style={[styles.fab, fabAnimatedStyle]}>
        <FAB
          icon="plus"
          onPress={handleCreateProject}
          gradientColors={[Colors.primary.blue, Colors.primary.darkBlue]}
        />
      </Animated.View>
    </View>
  )
}

// Helper function to adjust color brightness
const adjustColorBrightness = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  
  const newR = Math.min(255, Math.max(0, R))
  const newG = Math.min(255, Math.max(0, G))
  const newB = Math.min(255, Math.max(0, B))
  
  return '#' + (
    (newR << 16 | newG << 8 | newB)
      .toString(16)
      .padStart(6, '0')
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.background.light,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    height: 40
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900
  },
  headerActions: {
    flexDirection: 'row'
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutrals.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutrals.gray100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterContainer: {
    marginTop: Spacing.xs
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl
  },
  skeletonContainer: {
    flex: 1,
    marginTop: 180,
    paddingHorizontal: Spacing.lg
  },
  gridSkeletons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  gridSkeleton: {
    marginBottom: Spacing.md
  },
  gridItemContainer: {
    width: '50%',
    padding: 4
  },
  gridCard: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden'
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16
  },
  gridCardContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between'
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressIndicator: {
    alignItems: 'center'
  },
  progressTrack: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 2
  },
  progressText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.white,
    marginTop: 4
  },
  gridCardTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  gridCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  gridCardMeta: {
    fontSize: Typography.sizes.caption,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  listItemContainer: {
    marginBottom: Spacing.md
  },
  listCard: {
    borderRadius: 16,
    overflow: 'hidden'
  },
  listCardContent: {
    flexDirection: 'row',
    padding: Spacing.md,
    alignItems: 'center'
  },
  listCardLeft: {
    marginRight: Spacing.md
  },
  listIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listCardMiddle: {
    flex: 1,
    marginRight: Spacing.md
  },
  listCardTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 2
  },
  listCardDescription: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginBottom: Spacing.xs
  },
  listCardProgress: {
    marginTop: 4
  },
  listProgressTrack: {
    height: 4,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4
  },
  listProgressFill: {
    height: '100%',
    borderRadius: 2
  },
  listProgressText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  listCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl
  },
  emptyTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray800,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm
  },
  emptyText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray600,
    textAlign: 'center'
  }
})

export default ProjectsListScreen