import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  RefreshControl,
  StatusBar,
  Dimensions
} from 'react-native';
import Animated, { 
  FadeIn, 
  SlideInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import Spacing from '../theme/Spacing';
import Card from '../components/Card';
import Button from '../components/Button/Button';
import SkeletonLoader from '../components/Skeleton/SkeletonLoader';
import FAB from '../components/FAB';
import AvatarStack from '../components/Avatar/AvatarStack';
import StatusPill from '../components/StatusPill';
import { triggerImpact } from '../utils/HapticUtils';
import { useTheme } from '../hooks/useColorScheme';
import { formatDateString } from '../utils/helpers';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ProjectScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState([]);
  
  // Animation values
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const headerHeight = useSharedValue(180);
  
  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      try {
        // Delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setProjects([
          { 
            id: '1', 
            title: 'Mobile App Redesign', 
            description: 'Redesign the mobile app UI/UX with new brand guidelines',
            tasksCount: 8, 
            completedTasks: 3,
            progress: 0.4,
            dueDate: '2025-05-15',
            status: 'in-progress',
            priority: 'high',
            team: [
              { id: '1', name: 'Alex Johnson' },
              { id: '2', name: 'Morgan Smith' },
              { id: '3', name: 'Jamie Parker' }
            ],
            color: colors.primary.blue,
            icon: 'smartphone'
          },
          { 
            id: '2', 
            title: 'Website Development', 
            description: 'Build new company website with the new design system',
            tasksCount: 12, 
            completedTasks: 9,
            progress: 0.7,
            dueDate: '2025-06-10',
            status: 'in-progress',
            priority: 'medium',
            team: [
              { id: '1', name: 'Alex Johnson' },
              { id: '4', name: 'Taylor Reed' }
            ],
            color: colors.secondary.green,
            icon: 'globe'
          },
          { 
            id: '3', 
            title: 'Marketing Campaign', 
            description: 'Q2 digital marketing campaign for product launch',
            tasksCount: 5, 
            completedTasks: 1,
            progress: 0.2,
            dueDate: '2025-05-30',
            status: 'pending',
            priority: 'medium',
            team: [
              { id: '2', name: 'Morgan Smith' },
              { id: '5', name: 'Jordan Casey' }
            ],
            color: '#9C27B0',
            icon: 'trending-up'
          },
          {
            id: '4',
            title: 'Product Research',
            description: 'Market research for new product features',
            tasksCount: 6,
            completedTasks: 6,
            progress: 1.0,
            dueDate: '2025-04-20',
            status: 'completed',
            priority: 'low',
            team: [
              { id: '1', name: 'Alex Johnson' },
              { id: '3', name: 'Jamie Parker' }
            ],
            color: '#FF9800',
            icon: 'search'
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading projects:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
    
    // Animate header based on scroll position
    const newHeaderHeight = Math.max(80, 180 - offsetY * 0.5);
    headerHeight.value = withTiming(newHeaderHeight, { duration: 100 });
    
    if (offsetY > 100) {
      headerOpacity.value = withTiming(0.9, { duration: 200 });
    } else {
      headerOpacity.value = withTiming(1, { duration: 200 });
    }
  };

  const handleProjectPress = (projectId) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('ProjectDetailsScreen', { projectId });
  };

  const handleNewProject = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('NewProjectScreen');
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      opacity: headerOpacity.value,
      transform: [
        { 
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [0, -20],
            Extrapolation.CLAMP
          )
        }
      ]
    };
  });
  
  const titleAnimatedStyle = useAnimatedStyle(() => {
    const titleOpacity = interpolate(
      scrollY.value,
      [0, 50, 100],
      [1, 0.7, 0],
      Extrapolation.CLAMP
    );
    
    const titleScale = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.8],
      Extrapolation.CLAMP
    );
    
    return {
      opacity: titleOpacity,
      transform: [
        { scale: titleScale },
        { 
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [0, -30],
            Extrapolation.CLAMP
          )
        }
      ]
    };
  });
  
  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 40, 80],
        [1, 0.5, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        { 
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [0, -20],
            Extrapolation.CLAMP
          )
        }
      ]
    };
  });
  
  const renderProjectItem = ({ item, index }) => (
    <Animated.View 
      entering={SlideInUp.delay(index * 100).springify({ damping: 14 })}
      style={styles.projectItemContainer}
    >
      <Card
        onPress={() => handleProjectPress(item.id)}
        style={styles.projectCard}
        animationType="tilt"
        elevation={3}
        index={index}
      >
        <View style={styles.projectCardContent}>
          <View style={styles.projectCardHeader}>
            <View 
              style={[
                styles.iconContainer, 
                { backgroundColor: `${item.color}20` }
              ]}
            >
              <Feather name={item.icon} size={20} color={item.color} />
            </View>
            
            <StatusPill 
              label={item.status === 'completed' ? 'Completed' : 
                      item.status === 'in-progress' ? 'In Progress' : 'Pending'}
              type={item.status === 'completed' ? 'completed' : 
                    item.status === 'in-progress' ? 'in-progress' : 'pending'}
              priority={item.priority}
              small
            />
          </View>
          
          <View style={styles.projectCardBody}>
            <Text 
              style={[styles.projectTitle, { color: colors.text.primary }]} 
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text 
              style={[styles.projectDescription, { color: colors.text.secondary }]} 
              numberOfLines={2}
            >
              {item.description}
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressText, { color: colors.text.secondary }]}>
                Progress
              </Text>
              <Text style={[styles.progressPercentage, { color: colors.text.primary }]}>
                {`${Math.round(item.progress * 100)}%`}
              </Text>
            </View>
            
            <View style={[styles.progressTrack, { backgroundColor: colors.neutrals.gray200 }]}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${item.progress * 100}%`,
                    backgroundColor: item.color
                  }
                ]}
                entering={FadeIn.delay(300 + index * 100).duration(600)}
              />
            </View>
          </View>
          
          <View style={styles.projectCardFooter}>
            <View style={styles.taskInfo}>
              <Feather name="check-square" size={14} color={colors.text.secondary} />
              <Text style={[styles.taskInfoText, { color: colors.text.secondary }]}>
                {item.completedTasks}/{item.tasksCount}
              </Text>
            </View>
            
            <View style={styles.dueDateContainer}>
              <Feather name="calendar" size={14} color={colors.text.secondary} />
              <Text style={[styles.dueDateText, { color: colors.text.secondary }]}>
                {formatDateString(item.dueDate)}
              </Text>
            </View>
            
            <AvatarStack 
              users={item.team}
              maxDisplay={3}
              size={26}
            />
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderSkeletons = () => (
    <View style={styles.skeletonsContainer}>
      {[1, 2, 3].map((i) => (
        <SkeletonLoader.Card 
          key={i}
          height={180}
          style={styles.skeletonCard} 
        />
      ))}
    </View>
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="folder" size={60} color={colors.neutrals.gray300} />
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No Projects Found</Text>
      <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
        You have no projects yet. Create your first project!
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.light }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      
      {/* Header Background with Gradient */}
      <Animated.View style={[styles.headerBackground, headerAnimatedStyle]}>
        <LinearGradient
          colors={[isDark ? colors.primary.dark : colors.primary.light, isDark ? colors.background.light : colors.background.subtle]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>
      
      {/* Header Content */}
      <Animated.View 
        style={[
          styles.header, 
          { paddingTop: insets.top + 12 }
        ]}
      >
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={22} color={isDark ? colors.text.light : colors.neutrals.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
            onPress={() => navigation.navigate('SearchScreen')}
          >
            <Feather name="search" size={22} color={isDark ? colors.text.light : colors.neutrals.white} />
          </TouchableOpacity>
        </View>
        
        <Animated.Text 
          style={[
            styles.title, 
            { color: isDark ? colors.text.light : colors.neutrals.white },
            titleAnimatedStyle
          ]}
        >
          My Projects
        </Animated.Text>
        
        <Animated.Text 
          style={[
            styles.subtitle, 
            { color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.9)' },
            subtitleAnimatedStyle
          ]}
        >
          Manage and track your projects
        </Animated.Text>
      </Animated.View>
      
      {/* Project Stats Card */}
      <Animated.View 
        style={[
          styles.statsCard, 
          { 
            backgroundColor: isDark ? colors.card.background : colors.neutrals.white,
            borderColor: colors.card.border
          }
        ]}
        entering={SlideInUp.delay(200).springify({ damping: 14 })}
      >
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>
            {loading ? '...' : projects.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
            Total
          </Text>
        </View>
        
        <View style={[styles.statDivider, { backgroundColor: colors.neutrals.gray200 }]} />
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.status.success }]}>
            {loading ? '...' : projects.filter(p => p.status === 'in-progress').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
            Active
          </Text>
        </View>
        
        <View style={[styles.statDivider, { backgroundColor: colors.neutrals.gray200 }]} />
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.status.warning }]}>
            {loading ? '...' : projects.filter(p => p.progress === 1).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
            Completed
          </Text>
        </View>
      </Animated.View>
      
      {/* Main Content */}
      {loading ? (
        renderSkeletons()
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProjectItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.blue}
              colors={[colors.primary.blue]}
            />
          }
        />
      )}
      
      {/* FAB */}
      <FAB
        icon="plus"
        label="New Project"
        extended={scrollY.value < 10}
        onPress={handleNewProject}
        color={colors.primary.blue}
        position="bottomRight"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 0
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    zIndex: 1
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: -20,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    fontSize: Typography.sizes.titleLarge,
    fontWeight: Typography.weights.bold
  },
  statLabel: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
    marginHorizontal: Spacing.md
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 100
  },
  projectItemContainer: {
    marginBottom: Spacing.md
  },
  projectCard: {
    borderRadius: 16,
    overflow: 'hidden'
  },
  projectCardContent: {
    padding: Spacing.md
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  projectCardBody: {
    marginBottom: Spacing.md
  },
  projectTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    marginBottom: 4
  },
  projectDescription: {
    fontSize: Typography.sizes.bodySmall,
    lineHeight: 20
  },
  progressContainer: {
    marginBottom: Spacing.md
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  progressText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium
  },
  progressPercentage: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 3
  },
  projectCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  taskInfoText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    marginLeft: 4
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dueDateText: {
    fontSize: Typography.sizes.caption,
    marginLeft: 4
  },
  skeletonsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl
  },
  skeletonCard: {
    marginBottom: Spacing.md,
    borderRadius: 16
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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

export default ProjectScreen;