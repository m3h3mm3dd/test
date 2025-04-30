import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  FadeIn,
  FadeInDown,
  SlideInRight,
  Layout,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
  FadeOut
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SharedElement } from 'react-navigation-shared-element';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import Spacing from '../theme/Spacing';
import Card from '../components/Card';
import FAB from '../components/FAB';
import SegmentedControl from '../components/Controls/SegmentedControl';
import AvatarStack from '../components/Avatar/AvatarStack';
import SkeletonLoader from '../components/Skeleton/SkeletonLoader';
import { triggerImpact } from '../utils/HapticUtils';
import { useTheme } from '../hooks/useColorScheme';
import { formatDateString, calculatePercentage } from '../utils/helpers';

const { width, height } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Project data structure
interface Project {
  id: string;
  title: string;
  description: string;
  tasksTotal: number;
  tasksCompleted: number;
  progress: number;
  dueDate: string;
  team: Array<{ id: string, name: string, imageUrl?: string | null }>;
  color: string;
  icon: keyof typeof Feather.glyphMap;
  priority?: 'low' | 'medium' | 'high';
  status?: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
}

// Project view mode
type ViewMode = 'grid' | 'list' | 'board';

// Filters options
const FILTER_OPTIONS = [
  { id: 'all', label: 'All Projects' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' }
];

// Priority filter options
const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

// Sort options
const SORT_OPTIONS = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'Name' }
];

// Board status columns
const BOARD_COLUMNS = [
  { id: 'active', label: 'Active', color: '#3D5AFE' },
  { id: 'completed', label: 'Completed', color: '#00C853' }
];

const ProjectsListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showFilters, setShowFilters] = useState(false);
  
  // Refs
  const searchInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<FlatList>(null);
  
  // Animation values
  const headerHeight = useSharedValue(200);
  const scrollY = useSharedValue(0);
  const searchHeight = useSharedValue(0);
  const filtersHeight = useSharedValue(0);
  const fabScale = useSharedValue(1);
  const headerOpacity = useSharedValue(1);
  const backdropOpacity = useSharedValue(0);
  const searchInputWidth = useSharedValue('95%');
  
  // Load projects data
  useEffect(() => {
    fetchProjects();
    
    // Set status bar
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
    
    return () => {
      // Reset status bar on unmount
      StatusBar.setBarStyle('dark-content');
    };
  }, []);
  
  // Filter projects when filters change
  useEffect(() => {
    if (projects.length > 0) {
      applyFilters();
    }
  }, [projects, searchText, activeFilter, priorityFilter, projectFilter, sortBy]);

  // Animate header on mount
  useEffect(() => {
    headerHeight.value = withTiming(200, { duration: 500 });
  }, []);

  // Scroll handler for animations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const scrollOffset = event.contentOffset.y;
      scrollY.value = scrollOffset;
      
      // Parallax header effect
      headerOpacity.value = interpolate(
        scrollOffset,
        [0, 100],
        [1, 0.9],
        Extrapolation.CLAMP
      );
      
      // Collapse header on scroll
      headerHeight.value = interpolate(
        scrollOffset,
        [0, 120],
        [200, 80],
        Extrapolation.CLAMP
      );
    }
  });

  // Toggle search input with animation
  const toggleSearch = useCallback(() => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    if (showSearch) {
      // Hide search
      searchHeight.value = withTiming(0, { duration: 300 });
      searchInputWidth.value = withTiming('95%', { duration: 200 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
      
      // Reset search
      setSearchText('');
      
      // Set flag after animation
      setTimeout(() => {
        setShowSearch(false);
      }, 300);
    } else {
      // Show search
      setShowSearch(true);
      
      // Animate search height and backdrop
      searchHeight.value = withTiming(60, { duration: 300 });
      searchInputWidth.value = withSequence(
        withTiming('95%', { duration: 0 }),
        withDelay(100, withTiming('100%', { duration: 300 }))
      );
      backdropOpacity.value = withTiming(0.5, { duration: 300 });
      
      // Focus input after animation
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 350);
    }
  }, [showSearch]);
  
  // Toggle filters with animation
  const toggleFilters = useCallback(() => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    setShowFilters(prev => !prev);
    
    if (showFilters) {
      filtersHeight.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    } else {
      filtersHeight.value = withTiming(200, { duration: 300 });
      backdropOpacity.value = withTiming(0.3, { duration: 300 });
    }
  }, [showFilters]);
  
  // Toggle view mode with animation
  const toggleViewMode = useCallback(() => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    
    // Cycle through view modes: grid -> list -> board -> grid
    setViewMode(prev => {
      if (prev === 'grid') return 'list';
      if (prev === 'list') return 'board';
      return 'grid';
    });
    
    // Animate FAB
    fabScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1.1, { damping: 8, stiffness: 200 }),
      withTiming(1, { duration: 200 })
    );
    
    // Scroll to top
    if (scrollRef.current) {
      scrollRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, []);

  // Simulated API call to fetch projects
  const fetchProjects = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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
        priority: 'high',
        status: 'in-progress',
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
        priority: 'medium',
        status: 'in-progress',
        team: [
          { id: '1', name: 'Alex Johnson', imageUrl: null },
          { id: '4', name: 'Taylor Reed', imageUrl: null }
        ],
        color: Colors.success[500],
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
        priority: 'medium',
        status: 'in-progress',
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
        description: 'Market research for new product features and customer insights for future development',
        tasksTotal: 6,
        tasksCompleted: 6,
        progress: 1.0,
        dueDate: '2025-04-20',
        priority: 'low',
        status: 'completed',
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
        description: 'Upgrade backend services and API endpoints for better performance',
        tasksTotal: 14,
        tasksCompleted: 5,
        progress: 0.36,
        dueDate: '2025-07-15',
        priority: 'high',
        status: 'in-progress',
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
        priority: 'low',
        status: 'in-progress',
        team: [
          { id: '2', name: 'Morgan Smith', imageUrl: null },
          { id: '3', name: 'Jamie Parker', imageUrl: null },
          { id: '5', name: 'Jordan Casey', imageUrl: null }
        ],
        color: '#607D8B',
        icon: 'users'
      }
    ];
    
    setProjects(projectsData);
    setFilteredProjects(projectsData);
    
    // Update loading state
    setLoading(false);
    setRefreshing(false);
  };
  
  // Apply filters to projects
  const applyFilters = useCallback(() => {
    let filtered = [...projects];
    
    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchLower) || 
        project.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'active') {
        filtered = filtered.filter(project => project.progress < 1 && project.status !== 'completed');
      } else if (activeFilter === 'completed') {
        filtered = filtered.filter(project => project.progress === 1 || project.status === 'completed');
      }
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }
    
    // Apply project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(project => project.id === projectFilter);
    }
    
    // Apply sorting
    filtered = sortProjects(filtered, sortBy);
    
    setFilteredProjects(filtered);
  }, [projects, searchText, activeFilter, priorityFilter, projectFilter, sortBy]);
  
  // Sort projects based on selected sort option
  const sortProjects = useCallback((projectList: Project[], sortOption: string) => {
    const sorted = [...projectList];
    
    switch (sortOption) {
      case 'dueDate':
        return sorted.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      
      case 'priority':
        // Sort by priority field
        const priorityWeight = { 'high': 0, 'medium': 1, 'low': 2, undefined: 3 };
        return sorted.sort((a, b) => 
          (priorityWeight[a.priority || 'undefined'] || 3) - 
          (priorityWeight[b.priority || 'undefined'] || 3)
        );
      
      case 'status':
        // Sort by completion percentage
        return sorted.sort((a, b) => b.progress - a.progress);
      
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      
      default:
        return sorted;
    }
  }, []);
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchProjects(true);
  }, []);
  
  // Navigate to project details
  const handleProjectPress = useCallback((project: Project) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('ProjectDetailsScreen', { projectId: project.id });
  }, [navigation]);
  
  // Handle create new project
  const handleCreateProject = useCallback(() => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('NewProjectScreen');
  }, [navigation]);
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      opacity: headerOpacity.value
    };
  });
  
  const titleOpacityStyle = useAnimatedStyle(() => {
    return { 
      opacity: interpolate(
        headerHeight.value,
        [120, 180],
        [0, 1],
        Extrapolation.CLAMP
      )
    };
  });
  
  const compactTitleStyle = useAnimatedStyle(() => {
    return { 
      opacity: interpolate(
        headerHeight.value,
        [120, 90],
        [0, 1],
        Extrapolation.CLAMP
      ),
      transform: [
        { 
          translateY: interpolate(
            headerHeight.value,
            [120, 90],
            [20, 0],
            Extrapolation.CLAMP
          )
        }
      ]
    };
  });
  
  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: searchHeight.value,
      opacity: interpolate(
        searchHeight.value, 
        [0, 30, 60], 
        [0, 0.7, 1],
        Extrapolation.CLAMP
      ),
      width: searchInputWidth.value,
      overflow: searchHeight.value > 0 ? 'visible' : 'hidden'
    };
  });
  
  const filtersAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: filtersHeight.value,
      opacity: interpolate(
        filtersHeight.value, 
        [0, 80, 200], 
        [0, 0.7, 1],
        Extrapolation.CLAMP
      ),
      overflow: filtersHeight.value > 0 ? 'visible' : 'hidden'
    };
  });
  
  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: fabScale.value }],
      opacity: interpolate(
        scrollY.value,
        [-50, 0],
        [0, 1],
        Extrapolation.CLAMP
      )
    };
  });
  
  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
      display: backdropOpacity.value > 0 ? 'flex' : 'none'
    };
  });

  // Memoize current view mode icon
  const viewModeIcon = useMemo(() => {
    switch (viewMode) {
      case 'grid': return 'list';
      case 'list': return 'columns';
      case 'board': return 'grid';
    }
  }, [viewMode]);
  
  // Render list skeleton loaders
  const renderSkeletons = useCallback(() => (
    <View style={styles.skeletonContainer}>
      {viewMode === 'grid' ? (
        <View style={styles.gridSkeletons}>
          {[1, 2, 3, 4].map(i => (
            <SkeletonLoader.Card 
              key={i}
              width={width / 2 - 24} 
              height={210}
              style={styles.gridSkeleton} 
            />
          ))}
        </View>
      ) : viewMode === 'board' ? (
        <View style={styles.boardSkeletons}>
          <View style={styles.boardColumn}>
            <SkeletonLoader width="80%" height={24} style={{ marginBottom: 16 }} />
            <SkeletonLoader.Card height={150} style={{ marginBottom: 12 }} />
            <SkeletonLoader.Card height={150} style={{ marginBottom: 12 }} />
          </View>
          <View style={styles.boardColumn}>
            <SkeletonLoader width="80%" height={24} style={{ marginBottom: 16 }} />
            <SkeletonLoader.Card height={150} style={{ marginBottom: 12 }} />
          </View>
        </View>
      ) : (
        <View>
          {[1, 2, 3].map(i => (
            <SkeletonLoader.Card 
              key={i}
              height={100}
              style={{ marginBottom: 16 }} 
            />
          ))}
        </View>
      )}
    </View>
  ), [viewMode]);
  
  // Render grid item
  const renderGridItem = useCallback(({ item, index }: { item: Project, index: number }) => (
    <Animated.View
      layout={Layout.springify().damping(12)}
      entering={FadeInDown.delay(index * 80).duration(400).springify()}
      style={styles.gridItemContainer}
    >
      <Card
        style={styles.gridCard}
        onPress={() => handleProjectPress(item)}
        animationType="tilt"
        elevation={3}
        index={index}
      >
        <LinearGradient
          colors={[item.color, adjustColorBrightness(item.color, -20)]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.glassMorphicOverlay}>
            <BlurView tint="dark" intensity={5} style={StyleSheet.absoluteFill} />
          </View>
          
          <View style={styles.gridCardContent}>
            <View style={styles.gridCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <Feather name={item.icon} size={20} color="#fff" />
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressIndicator}>
                  <View style={styles.progressTrack}>
                    <Animated.View 
                      style={[
                        styles.progressFill, 
                        { width: `${item.progress * 100}%` }
                      ]}
                      entering={FadeInDown.delay((index * 80) + 200).duration(600)}
                    />
                  </View>
                  <Text style={styles.progressText}>{`${Math.round(item.progress * 100)}%`}</Text>
                </View>
                
                {item.priority && (
                  <View style={[
                    styles.priorityBadge,
                    getPriorityStyle(item.priority)
                  ]}>
                    <Text style={styles.priorityText}>{item.priority}</Text>
                  </View>
                )}
              </View>
            </View>
            
            <SharedElement id={`project.${item.id}.title`}>
              <Text style={styles.gridCardTitle} numberOfLines={2}>{item.title}</Text>
            </SharedElement>
            
            <Text style={styles.gridCardDesc} numberOfLines={2}>{item.description}</Text>
            
            <View style={styles.gridCardFooter}>
              <AvatarStack 
                users={item.team}
                maxDisplay={3}
                size={24}
              />
              
              <View style={styles.dueDateContainer}>
                <Feather name="calendar" size={12} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.dueDate}>
                  {formatDateString(item.dueDate)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Card>
    </Animated.View>
  ), [handleProjectPress]);
  
  // Render list item
  const renderListItem = useCallback(({ item, index }: { item: Project, index: number }) => (
    <Animated.View
      layout={Layout.springify().damping(12)}
      entering={FadeInDown.delay(index * 70).duration(400).springify()}
      style={styles.listItemContainer}
    >
      <Card
        style={styles.listCard}
        onPress={() => handleProjectPress(item)}
        animationType="spring"
        elevation={2}
        index={index}
      >
        <View style={styles.listCardContent}>
          <View style={styles.listCardLeft}>
            <View 
              style={[
                styles.listIconContainer, 
                { 
                  backgroundColor: `${item.color}15`,
                  borderColor: `${item.color}30`,
                }
              ]}
            >
              <Feather name={item.icon} size={22} color={item.color} />
            </View>
          </View>
          
          <View style={styles.listCardMiddle}>
            <SharedElement id={`project.${item.id}.title`}>
              <Text 
                style={[styles.listCardTitle, { color: colors.text.primary }]} 
                numberOfLines={1}
              >
                {item.title}
              </Text>
            </SharedElement>
            
            <Text 
              style={[styles.listCardDescription, { color: colors.text.secondary }]} 
              numberOfLines={1}
            >
              {item.description}
            </Text>
            
            <View style={styles.listCardProgress}>
              <View style={[styles.listProgressTrack, { backgroundColor: colors.neutrals.gray100 }]}>
                <Animated.View 
                  style={[
                    styles.listProgressFill, 
                    { 
                      width: `${item.progress * 100}%`,
                      backgroundColor: item.color
                    }
                  ]}
                  entering={FadeInDown.delay((index * 50) + 200).duration(600)}
                />
              </View>
              <Text style={[styles.listProgressText, { color: colors.text.secondary }]}>
                {item.tasksCompleted}/{item.tasksTotal} tasks
              </Text>
            </View>
          </View>
          
          <View style={styles.listCardRight}>
            {item.priority && (
              <View style={[
                styles.listPriorityBadge,
                getPriorityStyle(item.priority)
              ]}>
                <Text style={styles.listPriorityText}>{item.priority.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            
            <AvatarStack 
              users={item.team}
              maxDisplay={2}
              size={24}
              horizontal={false}
            />
            
            <Text style={[styles.listDueDate, { color: colors.text.secondary }]}>
              {formatDateString(item.dueDate, { month: 'short', day: 'numeric' })}
            </Text>
            
            <Feather name="chevron-right" size={18} color={colors.text.secondary} />
          </View>
        </View>
      </Card>
    </Animated.View>
  ), [handleProjectPress, colors]);

  // Render board view
  const renderBoardView = useCallback(() => {
    // Group projects by status (completed vs active)
    const activeProjects = filteredProjects.filter(p => p.progress < 1 && p.status !== 'completed');
    const completedProjects = filteredProjects.filter(p => p.progress === 1 || p.status === 'completed');
    
    const statuses = BOARD_COLUMNS.map(column => {
      const statusProjects = column.id === 'active' ? activeProjects : completedProjects;
      return { ...column, projects: statusProjects };
    });
    
    return (
      <AnimatedScrollView
        horizontal
        contentContainerStyle={styles.boardContent}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={width * 0.85}
        snapToAlignment="start"
      >
        {statuses.map((status, columnIndex) => (
          <Animated.View 
            key={status.id}
            style={styles.boardColumn}
            entering={SlideInRight.delay(columnIndex * 100).duration(400).springify()}
          >
            <View style={styles.boardColumnHeader}>
              <View style={[styles.boardColumnDot, { backgroundColor: status.color }]} />
              <Text style={[styles.boardColumnTitle, { color: colors.text.primary }]}>
                {status.label}
              </Text>
              <View style={[styles.boardColumnCount, { backgroundColor: colors.neutrals.gray100 }]}>
                <Text style={[styles.boardColumnCountText, { color: colors.text.secondary }]}>
                  {status.projects.length}
                </Text>
              </View>
            </View>
            
            {status.projects.length > 0 ? (
              <FlatList
                data={status.projects}
                keyExtractor={item => item.id}
                renderItem={({ item, index }) => renderBoardCard({ item, index, columnIndex })}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false} // Parent scroll handles this
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
              />
            ) : (
              <View style={[styles.boardEmptyState, { backgroundColor: colors.neutrals.gray100 }]}>
                <Feather name="inbox" size={24} color={colors.text.secondary} />
                <Text style={[styles.boardEmptyText, { color: colors.text.secondary }]}>
                  No {status.label.toLowerCase()} projects
                </Text>
              </View>
            )}
          </Animated.View>
        ))}
        
        {/* Add new column button */}
        <TouchableOpacity 
          style={[styles.addColumnButton, { borderColor: colors.neutrals.gray200 }]}
          onPress={() => console.log('Add column')}
        >
          <Feather name="plus" size={24} color={colors.text.secondary} />
          <Text style={[styles.addColumnText, { color: colors.text.secondary }]}>
            Add Column
          </Text>
        </TouchableOpacity>
      </AnimatedScrollView>
    );
  }, [filteredProjects, colors]);
  
  // Render board card
  const renderBoardCard = useCallback(({ item, index, columnIndex }: { item: Project, index: number, columnIndex: number }) => (
    <Animated.View
      entering={FadeInDown.delay((index * 70) + (columnIndex * 100)).duration(400).springify()}
      layout={Layout.springify().damping(12)}
    >
      <Card
        style={styles.boardCard}
        onPress={() => handleProjectPress(item)}
        animationType="spring"
        elevation={2}
        index={index}
      >
        <View style={styles.boardCardContent}>
          <View style={styles.boardCardHeader}>
            <View 
              style={[
                styles.boardColorBadge,
                { backgroundColor: item.color }
              ]}
            />
            <Text style={[styles.boardCardTitle, { color: colors.text.primary }]} numberOfLines={2}>
              {item.title}
            </Text>
            
            {item.priority && (
              <View style={[
                styles.boardPriorityBadge,
                getPriorityStyle(item.priority)
              ]}>
                <Text style={styles.boardPriorityText}>
                  {item.priority.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.boardCardDescription, { color: colors.text.secondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.boardCardFooter}>
            <View style={styles.boardCardStats}>
              <View style={styles.boardCardStat}>
                <Feather name="check-square" size={14} color={colors.text.secondary} />
                <Text style={[styles.boardCardStatText, { color: colors.text.secondary }]}>
                  {item.tasksCompleted}/{item.tasksTotal}
                </Text>
              </View>
              
              <View style={styles.boardCardProgress}>
                <View style={[styles.boardProgressTrack, { backgroundColor: colors.neutrals.gray100 }]}>
                  <View 
                    style={[
                      styles.boardProgressFill,
                      { 
                        width: `${item.progress * 100}%`,
                        backgroundColor: item.color
                      }
                    ]}
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.boardCardBottom}>
              <AvatarStack 
                users={item.team}
                maxDisplay={2}
                size={20}
              />
              
              <View style={styles.boardDueDateContainer}>
                <Feather name="calendar" size={12} color={colors.text.secondary} />
                <Text style={[styles.boardDueDate, { color: colors.text.secondary }]}>
                  {formatDateString(item.dueDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </Animated.View>
  ), [handleProjectPress, colors]);

  // Priority badge styles helper
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          backgroundColor: `${Colors.error[500]}20`,
          borderColor: `${Colors.error[500]}40`,
        };
      case 'medium':
        return {
          backgroundColor: `${Colors.warning[500]}20`,
          borderColor: `${Colors.warning[500]}40`,
        };
      case 'low':
        return {
          backgroundColor: `${Colors.success[500]}20`,
          borderColor: `${Colors.success[500]}40`,
        };
      default:
        return {
          backgroundColor: `${colors.neutrals.gray500}20`,
          borderColor: `${colors.neutrals.gray500}40`,
        };
    }
  };
  
  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.primary.main}10` }]}>
        <Feather name="folder" size={60} color={colors.primary.main} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No Projects Found</Text>
      <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
        {searchText
          ? 'No projects match your search criteria'
          : activeFilter !== 'all'
            ? `No ${activeFilter.toLowerCase()} projects found`
            : 'You have no projects yet. Create your first project!'
        }
      </Text>
      
      <TouchableOpacity 
        style={[styles.emptyButton, { backgroundColor: colors.primary.main }]}
        onPress={handleCreateProject}
      >
        <Feather name="plus" size={18} color="#fff" />
        <Text style={styles.emptyButtonText}>Create Project</Text>
      </TouchableOpacity>
    </View>
  ), [searchText, activeFilter, colors, handleCreateProject]);
  
  // Calculate content padding
  const getContentPadding = () => {
    return {
      paddingTop: 16 + (headerHeight.value || 200) + 
        (showSearch ? (searchHeight.value || 0) : 0) + 
        (showFilters ? (filtersHeight.value || 0) : 0)
    };
  };
  
  // Get the dynamic header title based on current filters
  const getHeaderTitle = () => {
    if (searchText) return 'Search Results';
    if (activeFilter === 'active') return 'Active Projects';
    if (activeFilter === 'completed') return 'Completed Projects';
    return 'Projects';
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      
      {/* Backdrop for overlays */}
      <Animated.View 
        style={[
          styles.backdrop, 
          backdropStyle,
          { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)' }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          onPress={() => {
            if (showSearch) toggleSearch();
            if (showFilters) toggleFilters();
          }}
          activeOpacity={1}
        />
      </Animated.View>
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            paddingTop: insets.top + 8,
            backgroundColor: colors.background.primary,
            borderBottomColor: `${colors.border}50`
          },
          headerAnimatedStyle
        ]}
      >
        {/* Compact header title - appears when scrolling */}
        <Animated.View style={[styles.compactTitle, compactTitleStyle]}>
          <Text style={[styles.compactTitleText, { color: colors.text.primary }]}>
            {getHeaderTitle()}
          </Text>
        </Animated.View>
        
        {/* Header title section */}
        <Animated.View style={[styles.titleContainer, titleOpacityStyle]}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {getHeaderTitle()}
          </Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[
                styles.headerButton, 
                { 
                  backgroundColor: showSearch 
                    ? `${colors.primary.main}20` 
                    : colors.neutrals.gray100 
                }
              ]}
              onPress={toggleSearch}
            >
              <Feather 
                name="search" 
                size={22} 
                color={showSearch ? colors.primary.main : colors.text.secondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.headerButton, 
                { 
                  backgroundColor: showFilters 
                    ? `${colors.primary.main}20` 
                    : colors.neutrals.gray100 
                }
              ]}
              onPress={toggleFilters}
            >
              <Feather 
                name="sliders" 
                size={22} 
                color={showFilters ? colors.primary.main : colors.text.secondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.headerButton, 
                { backgroundColor: colors.neutrals.gray100 }
              ]}
              onPress={toggleViewMode}
            >
              <Feather 
                name={viewModeIcon}
                size={22} 
                color={colors.text.secondary} 
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        {/* Search input */}
        <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
          <View style={[
            styles.searchInputContainer, 
            { 
              backgroundColor: colors.neutrals.gray100,
              borderColor: showSearch ? colors.primary.light : 'transparent',
            }
          ]}>
            <Feather name="search" size={18} color={colors.text.secondary} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: colors.text.primary }]}
              placeholder="Search projects..."
              placeholderTextColor={colors.text.secondary}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchText('')}
              >
                <Feather name="x" size={16} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
        
        {/* Filters */}
        <Animated.View style={[styles.filtersContainer, filtersAnimatedStyle]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text.secondary }]}>Status</Text>
              <SegmentedControl
                segments={FILTER_OPTIONS}
                selectedId={activeFilter}
                onChange={setActiveFilter}
              />
            </View>
            
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text.secondary }]}>Priority</Text>
              <View style={styles.pillsContainer}>
                {PRIORITY_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setPriorityFilter(option.value)}
                  >
                    <View style={[
                      styles.filterPill,
                      priorityFilter === option.value && styles.activeFilterPill,
                      { 
                        backgroundColor: priorityFilter === option.value 
                          ? `${colors.primary.main}15` 
                          : colors.neutrals.gray100,
                        borderColor: priorityFilter === option.value 
                          ? colors.primary.main 
                          : 'transparent',
                      }
                    ]}>
                      <Text style={[
                        styles.filterPillText,
                        { 
                          color: priorityFilter === option.value 
                            ? colors.primary.main 
                            : colors.text.secondary
                        }
                      ]}>
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text.secondary }]}>Sort By</Text>
              <View style={styles.pillsContainer}>
                {SORT_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSortBy(option.value)}
                  >
                    <View style={[
                      styles.filterPill,
                      sortBy === option.value && styles.activeFilterPill,
                      { 
                        backgroundColor: sortBy === option.value 
                          ? `${colors.primary.main}15` 
                          : colors.neutrals.gray100,
                        borderColor: sortBy === option.value 
                          ? colors.primary.main 
                          : 'transparent',
                      }
                    ]}>
                      <Text style={[
                        styles.filterPillText,
                        { 
                          color: sortBy === option.value 
                            ? colors.primary.main 
                            : colors.text.secondary
                        }
                      ]}>
                        {option.label}
                      </Text>
                      
                      {sortBy === option.value && (
                        <Feather 
                          name="chevron-down" 
                          size={14} 
                          color={colors.primary.main} 
                          style={styles.sortIcon} 
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
      
      {/* Projects List */}
      {loading ? (
        renderSkeletons()
      ) : viewMode === 'board' ? (
        // Board View
        <View style={[styles.boardWrapper, getContentPadding()]}>
          {renderBoardView()}
        </View>
      ) : (
        // Grid or List View
        <AnimatedFlatList
          ref={scrollRef}
          data={filteredProjects}
          keyExtractor={item => item.id}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force remount when changing view mode
          contentContainerStyle={[
            styles.listContent,
            getContentPadding()
          ]}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.main}
              colors={[colors.primary.main]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
      {/* FAB */}
      <Animated.View style={[styles.fab, fabAnimatedStyle]}>
        <FAB
          icon="plus"
          onPress={handleCreateProject}
          color={colors.primary.main}
          gradientColors={[colors.primary.main, colors.primary.dark]}
          animationType="spring"
          label="New Project"
          extended={!scrollY.value || scrollY.value < 10}
        />
      </Animated.View>
    </View>
  );
};

// Helper function to adjust color brightness
const adjustColorBrightness = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  const newR = Math.min(255, Math.max(0, R));
  const newG = Math.min(255, Math.max(0, G));
  const newB = Math.min(255, Math.max(0, B));
  
  return '#' + (
    (newR << 16 | newG << 8 | newB)
      .toString(16)
      .padStart(6, '0')
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5
  },
  backdropTouchable: {
    width: '100%',
    height: '100%'
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  compactTitle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 40, 
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  compactTitleText: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    height: 50,
    marginTop: 20
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchContainer: {
    overflow: 'hidden',
    alignItems: 'center'
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: Spacing.sm,
    borderWidth: 1
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: Typography.sizes.body
  },
  clearButton: {
    padding: 4
  },
  filtersContainer: {
    overflow: 'hidden'
  },
  filtersScrollContent: {
    paddingBottom: Spacing.md,
    gap: 24
  },
  filterSection: {
    marginRight: Spacing.lg
  },
  filterLabel: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    marginBottom: 8
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1
  },
  activeFilterPill: {
    borderWidth: 1
  },
  filterPillText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium
  },
  sortIcon: {
    marginLeft: 4
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl
  },
  skeletonContainer: {
    flex: 1,
    marginTop: 220,
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
  boardSkeletons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: 20
  },
  boardColumn: {
    width: width * 0.7,
    marginRight: Spacing.md
  },
  gridItemContainer: {
    width: '50%',
    padding: 4
  },
  gridCard: {
    height: 210,
    borderRadius: 16,
    overflow: 'hidden'
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16
  },
  glassMorphicOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3
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
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressContainer: {
    alignItems: 'flex-end'
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff'
  },
  gridCardTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  gridCardDesc: {
    fontSize: Typography.sizes.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginBottom: 8
  },
  gridCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  dueDate: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.white,
    marginLeft: 4
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
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  listCardMiddle: {
    flex: 1,
    marginRight: Spacing.md
  },
  listCardTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    marginBottom: 2
  },
  listCardDescription: {
    fontSize: Typography.sizes.bodySmall,
    marginBottom: Spacing.xs
  },
  listCardProgress: {
    marginTop: 8
  },
  listProgressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4
  },
  listProgressFill: {
    height: '100%',
    borderRadius: 2
  },
  listProgressText: {
    fontSize: Typography.sizes.caption
  },
  listCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 64,
    width: 60
  },
  listPriorityBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  listPriorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutrals.gray700
  },
  listDueDate: {
    fontSize: Typography.sizes.caption,
    marginTop: 4
  },
  // Board View Styles
  boardWrapper: {
    flex: 1
  },
  boardContent: {
    padding: Spacing.lg,
    paddingBottom: 100
  },
  boardColumn: {
    width: width * 0.75,
    marginRight: Spacing.lg,
    height: '100%'
  },
  boardColumnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  boardColumnDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  boardColumnTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    flex: 1
  },
  boardColumnCount: {
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 12
  },
  boardColumnCountText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold
  },
  boardCard: {
    borderRadius: 16,
    overflow: 'hidden'
  },
  boardCardContent: {
    padding: Spacing.md
  },
  boardCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs
  },
  boardColorBadge: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 8
  },
  boardCardTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    marginBottom: 4,
    flex: 1
  },
  boardPriorityBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1
  },
  boardPriorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutrals.gray700
  },
  boardCardDescription: {
    fontSize: Typography.sizes.caption,
    marginBottom: Spacing.md,
    lineHeight: 16
  },
  boardCardFooter: {
    gap: 12
  },
  boardCardStats: {
    width: '100%'
  },
  boardCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  boardCardStatText: {
    fontSize: Typography.sizes.caption,
    marginLeft: 4
  },
  boardCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  boardCardProgress: {
    width: '100%',
    marginTop: 4
  },
  boardProgressTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden'
  },
  boardProgressFill: {
    height: '100%',
    borderRadius: 1.5
  },
  boardDueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  boardDueDate: {
    fontSize: Typography.sizes.caption,
    marginLeft: 4
  },
  boardEmptyState: {
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7
  },
  boardEmptyText: {
    fontSize: Typography.sizes.caption,
    marginTop: 12
  },
  addColumnButton: {
    width: 160,
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 44,
    marginRight: Spacing.lg
  },
  addColumnText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    marginTop: 12
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 10
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    minHeight: 300
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  emptyTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm
  },
  emptyText: {
    fontSize: Typography.sizes.body,
    textAlign: 'center',
    marginBottom: Spacing.lg
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12
  },
  emptyButtonText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white,
    marginLeft: 8
  }
});

export default ProjectsListScreen;