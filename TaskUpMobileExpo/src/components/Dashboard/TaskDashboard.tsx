import React, { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  ScrollView, 
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl
} from 'react-native'
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  FadeIn,
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'

import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import Spacing from '../../theme/Spacing'
import DashboardCard from './DashboardCard'
import AvatarStack from '../Avatar/AvatarStack'
import SegmentedControl from '../Controls/SegmentedControl'
import TaskItem from '../Task/TaskItem'

const { width, height } = Dimensions.get('window')
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

const TaskDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('upcoming')
  const scrollY = useSharedValue(0)
  const lastContentOffset = useSharedValue(0)
  const isScrolling = useSharedValue(false)
  const fabVisible = useSharedValue(1)
  
  const filters = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'today', label: 'Today' },
    { id: 'completed', label: 'Completed' }
  ]
  
  const statCards = [
    { 
      id: '1', 
      title: 'Tasks Completed', 
      value: '24', 
      icon: 'check-circle', 
      gradientColors: [Colors.primary.blue, Colors.primary.darkBlue] 
    },
    { 
      id: '2', 
      title: 'Projects Active', 
      value: '7', 
      icon: 'briefcase', 
      gradientColors: [Colors.secondary.green, '#009688'] 
    },
    { 
      id: '3', 
      title: 'Team Members', 
      value: '12', 
      icon: 'users', 
      gradientColors: ['#9C27B0', '#673AB7'] 
    }
  ]
  
  const tasks = [
    { 
      id: '1', 
      title: 'Design System Updates', 
      description: 'Update button and card components',
      status: 'in-progress', 
      dueDate: '2025-05-10',
      priority: 'high',
      project: 'Mobile App Redesign',
      assignees: [
        { id: '1', name: 'Alex Johnson', imageUrl: null },
        { id: '2', name: 'Morgan Smith', imageUrl: null }
      ]
    },
    { 
      id: '2', 
      title: 'Frontend Development Sprint', 
      description: 'Implement homepage and navigation',
      status: 'pending', 
      dueDate: '2025-05-15',
      priority: 'medium',
      project: 'Website Relaunch',
      assignees: [
        { id: '3', name: 'Jamie Parker', imageUrl: null }
      ]
    },
    { 
      id: '3', 
      title: 'Client Meeting Preparation', 
      description: 'Prepare slides and demo',
      status: 'in-progress', 
      dueDate: '2025-05-09',
      priority: 'high',
      project: 'Client X Project',
      assignees: [
        { id: '1', name: 'Alex Johnson', imageUrl: null },
        { id: '4', name: 'Taylor Reed', imageUrl: null }
      ]
    }
  ]
  
  useEffect(() => {
    StatusBar.setBarStyle('light-content')
    return () => {
      StatusBar.setBarStyle('dark-content')
    }
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setRefreshing(false)
  }
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (
        lastContentOffset.value > event.contentOffset.y &&
        isScrolling.value
      ) {
        fabVisible.value = withTiming(1, { duration: 300 })
      } else if (
        lastContentOffset.value < event.contentOffset.y &&
        isScrolling.value
      ) {
        fabVisible.value = withTiming(0, { duration: 300 })
      }
      lastContentOffset.value = event.contentOffset.y
      scrollY.value = event.contentOffset.y
    },
    onBeginDrag: () => {
      isScrolling.value = true
    },
    onEndDrag: () => {
      isScrolling.value = false
    },
  })
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -50],
      Extrapolation.CLAMP
    )
    
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0],
      Extrapolation.CLAMP
    )
    
    return {
      transform: [{ translateY }],
      opacity
    }
  })
  
  const blurAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      Extrapolation.CLAMP
    )
    
    return {
      opacity
    }
  })
  
  const fabAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      fabVisible.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    )
    
    const opacity = interpolate(
      fabVisible.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    )
    
    return {
      transform: [{ scale }],
      opacity
    }
  })

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header]}>
        <AnimatedBlurView 
          intensity={80} 
          tint="dark" 
          style={[StyleSheet.absoluteFill, blurAnimatedStyle]} 
        />
        <Animated.View style={[styles.headerContent, headerAnimatedStyle]}>
          <Text style={styles.greeting}>Hello, Alex</Text>
          <Text style={styles.date}>Tuesday, April 29</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="search" size={24} color={Colors.neutrals.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={24} color={Colors.neutrals.white} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.blue}
            colors={[Colors.primary.blue]}
          />
        }
      >
        <Animated.View entering={FadeInDown.delay(200).duration(700)}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            {statCards.map((card, index) => (
              <Animated.View 
                key={card.id} 
                entering={FadeInRight.delay(300 + index * 100).duration(700)}
              >
                <DashboardCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  gradientColors={card.gradientColors}
                  onPress={() => console.log(`Pressed ${card.title}`)}
                />
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
        
        <Animated.View 
          style={styles.tasksSection}
          entering={FadeInDown.delay(600).duration(700)}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Tasks</Text>
            <View style={styles.filterContainer}>
              <SegmentedControl
                segments={filters}
                selectedId={selectedFilter}
                onChange={setSelectedFilter}
              />
            </View>
          </View>
          
          <View style={styles.tasksList}>
            {tasks.map((task, index) => (
              <Animated.View 
                key={task.id}
                entering={FadeInDown.delay(700 + index * 100).duration(500)}
                style={styles.taskItemContainer}
              >
                <TaskItem 
                  task={task}
                  onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
                />
              </Animated.View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('TasksList')}
          >
            <Text style={styles.viewAllText}>View All Tasks</Text>
            <Feather name="arrow-right" size={16} color={Colors.primary.blue} />
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View 
          style={styles.projectsSection}
          entering={FadeInDown.delay(900).duration(700)}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Projects</Text>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => navigation.navigate('ProjectsList')}
            >
              <Feather name="more-horizontal" size={24} color={Colors.neutrals.gray700} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.projectCards}>
            <Animated.View entering={FadeIn.delay(1000).duration(700)}>
              <TouchableOpacity 
                style={styles.projectCard}
                onPress={() => navigation.navigate('ProjectDetails', { projectId: '1' })}
              >
                <View style={styles.projectCardHeader}>
                  <View style={[styles.projectIcon, { backgroundColor: 'rgba(61, 90, 254, 0.1)' }]}>
                    <Feather name="smartphone" size={20} color={Colors.primary.blue} />
                  </View>
                  <View style={styles.projectProgress}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: '40%' }]} />
                    </View>
                    <Text style={styles.progressText}>40%</Text>
                  </View>
                </View>
                <Text style={styles.projectTitle}>Mobile App Redesign</Text>
                <Text style={styles.projectMeta}>8 tasks • 3 in progress</Text>
                <View style={styles.projectFooter}>
                  <AvatarStack 
                    users={[
                      { id: '1', name: 'Alex Johnson' },
                      { id: '2', name: 'Morgan Smith' },
                      { id: '3', name: 'Jamie Parker' }
                    ]}
                    maxDisplay={3}
                  />
                  <Text style={styles.dueDate}>Due May 15</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View entering={FadeIn.delay(1100).duration(700)}>
              <TouchableOpacity 
                style={styles.projectCard}
                onPress={() => navigation.navigate('ProjectDetails', { projectId: '2' })}
              >
                <View style={styles.projectCardHeader}>
                  <View style={[styles.projectIcon, { backgroundColor: 'rgba(0, 200, 83, 0.1)' }]}>
                    <Feather name="globe" size={20} color={Colors.secondary.green} />
                  </View>
                  <View style={styles.projectProgress}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: '70%', backgroundColor: Colors.secondary.green }]} />
                    </View>
                    <Text style={styles.progressText}>70%</Text>
                  </View>
                </View>
                <Text style={styles.projectTitle}>Website Relaunch</Text>
                <Text style={styles.projectMeta}>12 tasks • 6 in progress</Text>
                <View style={styles.projectFooter}>
                  <AvatarStack 
                    users={[
                      { id: '1', name: 'Alex Johnson' },
                      { id: '4', name: 'Taylor Reed' }
                    ]}
                    maxDisplay={3}
                  />
                  <Text style={styles.dueDate}>Due May 22</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.ScrollView>
      
      <Animated.View style={[styles.fab, fabAnimatedStyle]}>
        <TouchableOpacity 
          style={styles.fabButton}
          onPress={() => navigation.navigate('TaskScreen', { isNew: true })}
        >
          <Feather name="plus" size={24} color={Colors.neutrals.white} />
        </TouchableOpacity>
      </Animated.View>
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
    backgroundColor: Colors.primary.blue,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10
  },
  headerContent: {
    flex: 1
  },
  greeting: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white
  },
  date: {
    fontSize: Typography.sizes.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4
  },
  headerActions: {
    flexDirection: 'row',
    position: 'absolute',
    top: 10,
    right: 0
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12
  },
  scrollView: {
    flex: 1,
    marginTop: 150
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 120
  },
  sectionTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md
  },
  cardsContainer: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
    marginBottom: Spacing.xl
  },
  tasksSection: {
    marginTop: Spacing.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingRight: Spacing.lg
  },
  filterContainer: {
    flex: 1,
    marginLeft: Spacing.lg
  },
  tasksList: {
    marginTop: Spacing.md
  },
  taskItemContainer: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.md
  },
  viewAllText: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium,
    marginRight: Spacing.xs
  },
  projectsSection: {
    marginTop: Spacing.xl
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  projectCards: {
    paddingHorizontal: Spacing.lg
  },
  projectCard: {
    backgroundColor: Colors.neutrals.white,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  projectProgress: {
    alignItems: 'center'
  },
  progressTrack: {
    width: 60,
    height: 6,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.blue,
    borderRadius: 3
  },
  progressText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    marginTop: 4
  },
  projectTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: Spacing.xs
  },
  projectMeta: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginBottom: Spacing.md
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dueDate: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray700
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default TaskDashboard