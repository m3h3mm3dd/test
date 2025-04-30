import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  FadeInDown,
  SlideInRight,
  Layout,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SharedElement } from 'react-navigation-shared-element';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import Spacing from '../theme/Spacing';
import Card from '../components/Card';
import FAB from '../components/FAB';
import SegmentedControl from '../components/Controls/SegmentedControl';
import AvatarStack from '../components/Avatar/AvatarStack';
import SkeletonLoader from '../components/Skeleton/SkeletonLoader';
import { triggerImpact } from '../utils/HapticUtils';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

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
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'low', label: 'Low Priority' }
];

// Sort options
const SORT_OPTIONS = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'Title' }
];

const ProjectsListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
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
  const searchInputRef = useRef(null);
  
  // Animation values
  const headerHeight = useSharedValue(150);
  const scrollY = useSharedValue(0);
  const searchHeight = useSharedValue(0);
  const filtersHeight = useSharedValue(0);
  const fabScale = useSharedValue(1);
  
  // Load projects data
  useEffect(() => {
    fetchProjects();
  }, []);
  
  // Filter projects when filters change
  useEffect(() => {
    if (projects.length > 0) {
      applyFilters();
    }
  }, [projects, searchText, activeFilter, priorityFilter, projectFilter, sortBy]);

  // Toggle search input
  const toggleSearch = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    if (showSearch) {
      // Hide search
      searchHeight.value = withTiming(0, { duration: 300 });
      
      // Reset search
      setSearchText('');
      
      // Set flag after animation
      setTimeout(() => {
        setShowSearch(false);
      }, 300);
    } else {
      // Show search
      setShowSearch(true);
      
      // Animate search height
      searchHeight.value = withTiming(60, { duration: 300 });
      
      // Focus input after animation
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  };
  
  // Toggle filters
  const toggleFilters = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    setShowFilters(!showFilters);
    
    if (showFilters) {
      filtersHeight.value = withTiming(0, { duration: 300 });
    } else {
      filtersHeight.value = withTiming(200, { duration: 300 });
    }
  };
  
  // Toggle view mode
  const toggleViewMode = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    // Cycle through view modes: grid -> list -> board -> grid
    setViewMode(prev => {
      if (prev === 'grid') return 'list';
      if (prev === 'list') return 'board';
      return 'grid';
    });
    
    // Animate FAB
    fabScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1, { damping: 15 })
    );
  };

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
    ];
    
    // Extract projects from tasks for filtering
    const uniqueProjects = Array.from(new Set(projectsData.map(project => project.id)))
      .map(id => {
        const project = projectsData.find(p => p.id === id);
        return {
          id,
          name: project?.title || 'Unknown Project',
          color: project?.color || theme.neutrals.gray500
        };
      });
    
    setProjects(projectsData);
    setFilteredProjects(projectsData);
    
    // Update loading state
    setLoading(false);
    setRefreshing(false);
  };
  
  // Apply filters to projects
  const applyFilters = () => {
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
        filtered = filtered.filter(project => project.progress < 1);
      } else if (activeFilter === 'completed') {
        filtered = filtered.filter(project => project.progress === 1);
      }
    }
    
    // Apply priority filter (mock implementation)
    if (priorityFilter !== 'all') {
      // This would be based on a real priority field
      filtered = filtered.filter((_, index) => {
        if (priorityFilter === 'high') return index % 3 === 0;
        if (priorityFilter === 'medium') return index % 3 === 1;
        if (priorityFilter === 'low') return index % 3 === 2;
        return true;
      });
    }
    
    // Apply project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(project => project.id === projectFilter);
    }
    
    // Apply sorting
    filtered = sortProjects(filtered, sortBy);
    
    setFilteredProjects(filtered);
  };
  
  // Sort projects based on selected sort option
  const sortProjects = (projectList: Project[], sortOption: string) => {
    const sorted = [...projectList];
    
    switch (sortOption) {
      case 'dueDate':
        return sorted.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      
      case 'priority':
        // Mock priority sorting - would use actual priority field
        return sorted.sort((a, b) => {
          const getPriority = (project: Project) => {
            const id = parseInt(project.id);
            return id % 3; // 0 = high, 1 = medium, 2 = low
          };
          return getPriority(a) - getPriority(b);
        });
      
      case 'status':
        // Sort by completion percentage
        return sorted.sort((a, b) => b.progress - a.progress);
      
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      
      default:
        return sorted;
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchProjects(true);
  };
  
  // Navigate to project details
  const handleProjectPress = (project: Project) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('ProjectDetailsScreen', { projectId: project.id });
  };
  
  // Handle create new project
  const handleCreateProject = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('NewProjectScreen');
  };
  
  // Handle scroll for collapsing header
  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    scrollY.value = scrollOffset;
    
    // Collapse header on scroll
    const newHeight = Math.max(80, 150 - scrollOffset);
    headerHeight.value = withTiming(newHeight, { duration: 100 });
  };
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value
    };
  });
  
  const titleOpacityStyle = useAnimatedStyle(() => {
    const opacity = withTiming(headerHeight.value > 100 ? 1 : 0, { duration: 200 });
    return { opacity };
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
      transform: [{ scale: fabScale.value }]
    };
  });
  
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
  );
  
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
  );
  
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
            
            <Feather name="chevron-right" size={18} color={theme.neutrals.gray500} />
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  // Render board view
  const renderBoardView = () => {
    // Group projects by status (completed vs active)
    const activeProjects = filteredProjects.filter(p => p.progress < 1);
    const completedProjects = filteredProjects.filter(p => p.progress === 1);
    
    return (
      <ScrollView
        horizontal
        contentContainerStyle={styles.boardContent}
        showsHorizontalScrollIndicator={false}
      >
        {/* Active Projects Column */}
        <View style={styles.boardColumn}>
          <View style={styles.boardColumnHeader}>
            <View style={[styles.boardColumnDot, { backgroundColor: theme.status.success }]} />
            <Text style={[styles.boardColumnTitle, { color: theme.text.primary }]}>Active</Text>
            <Text style={styles.boardColumnCount}>{activeProjects.length}</Text>
          </View>
          
          <FlatList
            data={activeProjects}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => renderBoardCard({ item, index })}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Parent scroll handles this
            contentContainerStyle={{ gap: 12 }}
            ListEmptyComponent={
              <View style={styles.boardEmptyState}>
                <Text style={[styles.boardEmptyText, { color: theme.text.secondary }]}>No active projects</Text>
              </View>
            }
          />
        </View>
        
        {/* Completed Projects Column */}
        <View style={styles.boardColumn}>
          <View style={styles.boardColumnHeader}>
            <View style={[styles.boardColumnDot, { backgroundColor: theme.status.warning }]} />
            <Text style={[styles.boardColumnTitle, { color: theme.text.primary }]}>Completed</Text>
            <Text style={styles.boardColumnCount}>{completedProjects.length}</Text>
          </View>
          
          <FlatList
            data={completedProjects}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => renderBoardCard({ item, index })}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Parent scroll handles this
            contentContainerStyle={{ gap: 12 }}
            ListEmptyComponent={
              <View style={styles.boardEmptyState}>
                <Text style={[styles.boardEmptyText, { color: theme.text.secondary }]}>No completed projects</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    );
  };
  
  // Render board card
  const renderBoardCard = ({ item, index }: { item: Project, index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      layout={Layout.springify()}
    >
      <Card
        style={styles.boardCard}
        onPress={() => handleProjectPress(item)}
        animationType="spring"
        sharedElementId={`project.${item.id}.card`}
      >
        <View style={styles.boardCardContent}>
          <View style={styles.boardCardHeader}>
            <View 
              style={[
                styles.boardColorBadge,
                { backgroundColor: item.color }
              ]}
            />
            <Text style={[styles.boardCardTitle, { color: theme.text.primary }]} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          
          <Text style={[styles.boardCardDescription, { color: theme.text.secondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.boardCardFooter}>
            <View style={styles.boardCardStats}>
              <View style={styles.boardCardStat}>
                <Feather name="check-square" size={14} color={theme.text.secondary} />
                <Text style={[styles.boardCardStatText, { color: theme.text.secondary }]}>
                  {item.tasksCompleted}/{item.tasksTotal}
                </Text>
              </View>
              
              <View style={styles.boardCardProgress}>
                <View style={[styles.boardProgressTrack, { backgroundColor: theme.neutrals.gray200 }]}>
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
            
            <AvatarStack 
              users={item.team}
              maxDisplay={2}
              size={20}
            />
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background.primary} />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          headerAnimatedStyle, 
          { 
            paddingTop: insets.top,
            backgroundColor: theme.background.primary,
            borderBottomColor: theme.neutrals.gray200
          }
        ]}
      >
        <Animated.View style={[styles.titleContainer, titleOpacityStyle]}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Projects</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: theme.neutrals.gray100 }]}
              onPress={toggleSearch}
            >
              <Feather 
                name="search" 
                size={22} 
                color={showSearch ? theme.primary.main : theme.text.secondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.headerButton, 
                { 
                  backgroundColor: showFilters 
                    ? `${theme.primary.main}20` 
                    : theme.neutrals.gray100 
                }
              ]}
              onPress={toggleFilters}
            >
              <Feather 
                name="sliders" 
                size={22} 
                color={showFilters ? theme.primary.main : theme.text.secondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: theme.neutrals.gray100 }]}
              onPress={toggleViewMode}
            >
              <Feather 
                name={
                  viewMode === 'grid' 
                    ? 'list' 
                    : viewMode === 'list' 
                      ? 'columns' 
                      : 'grid'
                } 
                size={22} 
                color={theme.text.secondary} 
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        {/* Search input */}
        <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
          <View style={[styles.searchInputContainer, { backgroundColor: theme.neutrals.gray100 }]}>
            <Feather name="search" size={18} color={theme.text.secondary} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: theme.text.primary }]}
              placeholder="Search projects..."
              placeholderTextColor={theme.text.secondary}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchText('')}
              >
                <Feather name="x" size={16} color={theme.text.secondary} />
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
              <Text style={[styles.filterLabel, { color: theme.text.secondary }]}>Status</Text>
              <SegmentedControl
                segments={FILTER_OPTIONS}
                selectedId={activeFilter}
                onChange={setActiveFilter}
              />
            </View>
            
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: theme.text.secondary }]}>Priority</Text>
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
                          ? `${theme.primary.main}15` 
                          : theme.neutrals.gray100 
                      }
                    ]}>
                      <Text style={[
                        styles.filterPillText,
                        { 
                          color: priorityFilter === option.value 
                            ? theme.primary.main 
                            : theme.text.secondary
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
              <Text style={[styles.filterLabel, { color: theme.text.secondary }]}>Sort By</Text>
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
                          ? `${theme.primary.main}15` 
                          : theme.neutrals.gray100 
                      }
                    ]}>
                      <Text style={[
                        styles.filterPillText,
                        { 
                          color: sortBy === option.value 
                            ? theme.primary.main 
                            : theme.text.secondary
                        }
                      ]}>
                        {option.label}
                      </Text>
                      
                      {sortBy === option.value && (
                        <Feather 
                          name="chevron-down" 
                          size={14} 
                          color={theme.primary.main} 
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
        <View 
          style={[
            styles.boardWrapper,
            { 
              marginTop: headerHeight.value + 
                (showSearch ? searchHeight.value : 0) + 
                (showFilters ? filtersHeight.value : 0)
            }
          ]}
        >
          {renderBoardView()}
        </View>
      ) : (
        // Grid or List View
        <AnimatedFlatList
          data={filteredProjects}
          keyExtractor={item => item.id}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force remount when changing view mode
          contentContainerStyle={[
            styles.listContent,
            { 
              paddingTop: headerHeight.value + 
                (showSearch ? searchHeight.value : 0) + 
                (showFilters ? filtersHeight.value : 0) + 16
            }
          ]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary.main}
              colors={[theme.primary.main]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="folder" size={60} color={theme.neutrals.gray300} />
              <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No Projects Found</Text>
              <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
                {searchText
                  ? 'No projects match your search criteria'
                  : activeFilter !== 'all'
                    ? `No ${activeFilter} projects found`
                    : 'You have no projects yet. Create your first project!'
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
          gradientColors={[theme.primary.main, theme.primary.dark]}
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
    overflow: 'hidden'
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: Spacing.sm
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
    borderRadius: 16
  },
  activeFilterPill: {
    borderWidth: 1,
    borderColor: Colors.primary.blue
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
  // Board View Styles
  boardWrapper: {
    flex: 1
  },
  boardContent: {
    padding: Spacing.lg,
    paddingBottom: 100
  },
  boardColumn: {
    width: width * 0.7,
    marginRight: Spacing.lg,
    height: '100%'
  },
  boardColumnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  boardColumnDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  boardColumnTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    flex: 1
  },
  boardColumnCount: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray600,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  boardCard: {
    borderRadius: 12,
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
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 8
  },
  boardCardTitle: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    marginBottom: 4
  },
  boardCardDescription: {
    fontSize: Typography.sizes.caption,
    marginBottom: Spacing.md,
    lineHeight: 16
  },
  boardCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  boardCardStats: {
    flex: 1,
    marginRight: 8
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
  boardCardProgress: {
    width: '100%'
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
  boardEmptyState: {
    height: 100,
    backgroundColor: Colors.neutrals.gray100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7
  },
  boardEmptyText: {
    fontSize: Typography.sizes.caption
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
    marginTop: Spacing.md,
    marginBottom: Spacing.sm
  },
  emptyText: {
    fontSize: Typography.sizes.body,
    textAlign: 'center'
  }
});

export default ProjectsListScreen;