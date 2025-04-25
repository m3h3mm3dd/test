import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown,
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Hooks/UseTheme';
import { useAuth } from '../../Hooks/UseAuth';
import { Text } from '../../Components/UI/Text';
import { Card } from '../../Components/UI/Card';
import { GlassmorphicCard } from '../../Components/UI/GlassmorphicCard';
import { ProgressCircle } from '../../Components/Charts/ProgressCircle';
import { ProjectsList } from '../../Components/Lists/ProjectsList';
import { TasksList } from '../../Components/Lists/TasksList';
import { PerformanceChart } from '../../Components/Charts/PerformanceChart';
import { IconButton } from '../../Components/UI/IconButton';
import { QuickAddModal } from '../../Components/Modals/QuickAddModal';
import { ProjectService } from '../../Services/ProjectService';
import { TaskService } from '../../Services/TaskService';
import Icon from 'react-native-vector-icons/Ionicons';

export const DashboardScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeProjects, setActiveProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [stats, setStats] = useState({
    projectCount: 0,
    completionRate: 0,
    upcomingDeadlines: 0,
    overdueCount: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0],
      Extrapolation.CLAMP
    );
    
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -50],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const loadDashboardData = async () => {
    try {
      const projectsData = await ProjectService.getActiveProjects();
      setActiveProjects(projectsData);
      
      const tasksData = await TaskService.getRecentTasks();
      setRecentTasks(tasksData);
      
      const statsData = await ProjectService.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.log('Failed to load dashboard data', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const toggleQuickAdd = () => {
    setShowQuickAdd(!showQuickAdd);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text variant="h1" style={styles.greeting}>
            Hello, {user?.name?.split(' ')[0] || 'there'}
          </Text>
          <Text variant="body" style={{ color: theme.colors.textSecondary }}>
            Let's see what you've got today
          </Text>
        </Animated.View>
        
        <View style={styles.statsContainer}>
          <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.statsRow}>
            <GlassmorphicCard style={styles.statCard}>
              <Text variant="subtitle" style={{ color: theme.colors.textSecondary }}>
                Projects
              </Text>
              <Text variant="h1" style={{ color: theme.colors.text }}>
                {stats.projectCount}
              </Text>
            </GlassmorphicCard>
            
            <GlassmorphicCard style={styles.statCard}>
              <Text variant="subtitle" style={{ color: theme.colors.textSecondary }}>
                Upcoming
              </Text>
              <Text variant="h1" style={{ color: theme.colors.text }}>
                {stats.upcomingDeadlines}
              </Text>
            </GlassmorphicCard>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(300).duration(700)} style={styles.statsRow}>
            <GlassmorphicCard style={styles.statCard}>
              <Text variant="subtitle" style={{ color: theme.colors.textSecondary }}>
                Completion
              </Text>
              <View style={styles.progressContainer}>
                <ProgressCircle 
                  progress={stats.completionRate / 100} 
                  size={60} 
                />
                <Text variant="h2" style={{ marginLeft: 8 }}>
                  {stats.completionRate}%
                </Text>
              </View>
            </GlassmorphicCard>
            
            <GlassmorphicCard style={styles.statCard}>
              <Text variant="subtitle" style={{ color: theme.colors.textSecondary }}>
                Overdue
              </Text>
              <Text 
                variant="h1" 
                style={{ color: stats.overdueCount > 0 ? theme.colors.error : theme.colors.text }}
              >
                {stats.overdueCount}
              </Text>
            </GlassmorphicCard>
          </Animated.View>
        </View>

        <Animated.View 
          entering={FadeInDown.delay(400).duration(700)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text variant="h2">Active Projects</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Projects')}
              style={styles.viewAllButton}
            >
              <Text 
                variant="button" 
                style={{ color: theme.colors.primary }}
              >
                View All
              </Text>
              <Icon 
                name="chevron-forward" 
                size={16} 
                color={theme.colors.primary}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
          <ProjectsList 
            projects={activeProjects}
            variant="horizontal"
          />
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(500).duration(700)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text variant="h2">Recent Tasks</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Tasks')}
              style={styles.viewAllButton}
            >
              <Text 
                variant="button" 
                style={{ color: theme.colors.primary }}
              >
                View All
              </Text>
              <Icon 
                name="chevron-forward" 
                size={16} 
                color={theme.colors.primary}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
          <TasksList 
            tasks={recentTasks}
            variant="compact"
            limit={3}
          />
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(600).duration(700)}
          style={styles.section}
        >
          <Text variant="h2" style={styles.sectionTitle}>Performance Overview</Text>
          <Card style={styles.chartCard}>
            <PerformanceChart />
          </Card>
        </Animated.View>
      </Animated.ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={toggleQuickAdd}
        activeOpacity={0.8}
      >
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>
      
      <QuickAddModal
        isVisible={showQuickAdd}
        onClose={toggleQuickAdd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartCard: {
    padding: 16,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});