import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Platform,
  RefreshControl
} from 'react-native';
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
  Extrapolation,
  Layout
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import Spacing from '../theme/Spacing';
import AvatarStack from '../components/Avatar/AvatarStack';
import FAB from '../components/FAB';
import { triggerImpact } from '../utils/HapticUtils';
import { useTheme } from '../hooks/useColorScheme';
import Button from '../components/Button/Button';
import Card from '../components/Card';
import StatusPill from '../components/StatusPill';
import SkeletonLoader from '../components/Skeleton/SkeletonLoader';

const { width, height } = Dimensions.get('window');
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface Team {
  id: string;
  name: string;
  description: string;
  members: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  tasksCount: number;
  projectsCount: number;
  activeProjects: boolean;
  isNew?: boolean;
  lastActivity?: string;
}

const TeamsListScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Animated values
  const searchBarWidth = useSharedValue(width - 80);
  const filterHeight = useSharedValue(0);
  const filterOpacity = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const fabOpacity = useSharedValue(1);
  
  // Load teams data
  useEffect(() => {
    loadTeams();
  }, []);
  
  const loadTeams = async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
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
          activeProjects: true,
          lastActivity: '2025-04-28T09:30:00Z'
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
          activeProjects: true,
          isNew: true,
          lastActivity: '2025-04-29T14:15:00Z'
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
          activeProjects: true,
          lastActivity: '2025-04-27T11:45:00Z'
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
          activeProjects: false,
          lastActivity: '2025-04-25T16:30:00Z'
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
          activeProjects: true,
          lastActivity: '2025-04-26T10:20:00Z'
        }
      ];
      
      // Sort teams by last activity
      mockTeams.sort((a, b) => {
        return new Date(b.lastActivity || '').getTime() - new Date(a.lastActivity || '').getTime();
      });
      
      setTeams(mockTeams);
      
      // Apply current filters
      filterTeams(mockTeams, searchQuery, activeFilter);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Filter teams based on search query and active filter
  const filterTeams = useCallback((teamsList = teams, query = searchQuery, filter = activeFilter) => {
    let result = [...teamsList];
    
    // Apply search filter
    if (query) {
      result = result.filter(team => 
        team.name.toLowerCase().includes(query.toLowerCase()) ||
        team.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply tab filter
    switch (filter) {
      case 'active':
        result = result.filter(team => team.activeProjects);
        break;
      case 'my':
        // In a real app, this would filter teams the current user is part of
        result = result.filter((_, index) => index % 2 === 0); // Simulating "my teams"
        break;
    }
    
    setFilteredTeams(result);
  }, [teams, searchQuery, activeFilter]);
  
  // Update filtered teams when search or filter changes
  useEffect(() => {
    filterTeams();
  }, [searchQuery, activeFilter, filterTeams]);
  
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };
  
  const handleRefresh = async () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    await loadTeams(true);
  };
  
  const handleFilterPress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    setShowFilters(!showFilters);
    
    if (!showFilters) {
      // Show filters
      filterHeight.value = withTiming(50, { duration: 300 });
      filterOpacity.value = withTiming(1, { duration: 300 });
    } else {
      // Hide filters
      filterHeight.value = withTiming(0, { duration: 300 });
      filterOpacity.value = withTiming(0, { duration: 300 });
    }
  };
  
  const handleFilterSelect = (filter: string) => {
    if (filter === activeFilter) return;
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filter);
  };
  
  const handleTeamPress = (teamId: string) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('TeamDetails', { teamId });
  };
  
  const handleCreateTeam = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('CreateTeam');
  };
  
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
    
    // Fade out header on scroll
    if (offsetY > 20) {
      headerOpacity.value = withTiming(0.8, { duration: 200 });
      searchBarWidth.value = withTiming(width - 32, { duration: 200 });
      
      // Hide FAB when scrolling down significantly
      if (offsetY > 200) {
        fabOpacity.value = withTiming(0, { duration: 200 });
      } else {
        fabOpacity.value = withTiming(1, { duration: 200 });
      }
    } else {
      headerOpacity.value = withTiming(1, { duration: 200 });
      searchBarWidth.value = withTiming(width - 80, { duration: 200 });
      fabOpacity.value = withTiming(1, { duration: 200 });
    }
  };
  
  // Render team item
  const renderTeamItem = ({ item, index }) => (
    <Animated.View
      entering={SlideInUp.delay(index * 100).duration(400)}
      layout={Layout.springify()}
      style={item.isNew && styles.newTeamHighlight}
    >
      <Card
        style={styles.teamCard}
        onPress={() => handleTeamPress(item.id)}
        animationType="scale"
        index={index}
      >
        <View style={styles.teamCardHeader}>
          <View style={styles.teamHeaderContent}>
            <Text style={[styles.teamName, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
              {item.name}
            </Text>
            <Text style={[styles.teamDescription, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
              {item.description}
            </Text>
          </View>
          
          {item.isNew && (
            <StatusPill
              label="NEW"
              type="info"
              small
              animate
            />
          )}
        </View>
        
        <View style={[styles.teamCardContent, { borderTopColor: isDark ? colors.border : Colors.neutrals.gray200 }]}>
          <View style={styles.membersSection}>
            <AvatarStack
              users={item.members}
              size={32}
              maxDisplay={4}
            />
            <Text style={[styles.membersCount, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
              {item.members.length} members
            </Text>
          </View>
          
          <View style={[styles.statsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.neutrals.gray100 }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
                {item.tasksCount}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
                Tasks
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: isDark ? colors.border : Colors.neutrals.gray300 }]} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
                {item.projectsCount}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
                Projects
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: isDark ? colors.border : Colors.neutrals.gray300 }]} />
            
            <View style={styles.statItem}>
              <StatusPill
                label={item.activeProjects ? 'Active' : 'Inactive'}
                type={item.activeProjects ? 'success' : 'default'}
                small
              />
            </View>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
  
  // Render skeleton loading state
  const renderSkeletonLoader = () => (
    <View style={styles.loadingContainer}>
      {[1, 2, 3].map((_, index) => (
        <SkeletonLoader.Card 
          key={`skeleton-${index}`} 
          height={180} 
          style={styles.skeletonCard}
        />
      ))}
    </View>
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Animated.View 
        style={[
          styles.emptyIconContainer, 
          { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.neutrals.gray100 }
        ]}
        entering={ZoomIn.duration(400)}
      >
        <Feather 
          name="users" 
          size={48} 
          color={isDark ? colors.text.secondary : Colors.neutrals.gray400} 
        />
      </Animated.View>
      <Text style={[styles.emptyTitle, { color: isDark ? colors.text.primary : Colors.neutrals.gray800 }]}>
        No teams found
      </Text>
      <Text style={[styles.emptyMessage, { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }]}>
        {searchQuery 
          ? "No teams match your search criteria"
          : "You don't have any teams yet. Create a new team to get started."
        }
      </Text>
      
      {!searchQuery && (
        <Button
          title="Create Team"
          onPress={handleCreateTeam}
          variant="primary"
          size="medium"
          icon="plus"
          style={styles.createEmptyButton}
        />
      )}
    </View>
  );
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      borderBottomColor: isDark 
        ? interpolate(
            headerOpacity.value,
            [0.8, 1],
            [colors.border, 'transparent'],
            Extrapolation.CLAMP
          )
        : interpolate(
            headerOpacity.value,
            [0.8, 1],
            [Colors.neutrals.gray200, 'transparent'],
            Extrapolation.CLAMP
          ),
      borderBottomWidth: interpolate(
        headerOpacity.value,
        [0.8, 1],
        [1, 0],
        Extrapolation.CLAMP
      )
    };
  });
  
  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: searchBarWidth.value
    };
  });
  
  const filterContainerStyle = useAnimatedStyle(() => {
    return {
      height: filterHeight.value,
      opacity: filterOpacity.value,
      transform: [
        {
          translateY: interpolate(
            filterOpacity.value,
            [0, 1],
            [-10, 0],
            Extrapolation.CLAMP
          )
        }
      ]
    };
  });
  
  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fabOpacity.value,
      transform: [
        {
          scale: fabOpacity.value
        },
        {
          translateY: interpolate(
            fabOpacity.value,
            [0, 1],
            [20, 0],
            Extrapolation.CLAMP
          )
        }
      ]
    };
  });
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: isDark ? colors.background.dark : Colors.background.light,
          paddingTop: insets.top
        }
      ]}
    >
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={isDark ? colors.background.dark : Colors.background.light} 
      />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { backgroundColor: isDark ? colors.background.dark : Colors.background.light },
          headerAnimatedStyle
        ]}
      >
        <Text style={[styles.title, { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }]}>
          Teams
        </Text>
        
        <View style={styles.searchContainer}>
          <Animated.View 
            style={[
              styles.searchBar, 
              { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : Colors.neutrals.gray100 },
              searchBarAnimatedStyle
            ]}
          >
            <Feather 
              name="search" 
              size={18} 
              color={isDark ? colors.text.secondary : Colors.neutrals.gray500} 
            />
            <TextInput
              style={[
                styles.searchInput,
                { color: isDark ? colors.text.primary : Colors.neutrals.gray900 }
              ]}
              placeholder="Search teams..."
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : Colors.neutrals.gray500}
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Feather 
                  name="x" 
                  size={18} 
                  color={isDark ? colors.text.secondary : Colors.neutrals.gray500} 
                />
              </TouchableOpacity>
            )}
          </Animated.View>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : Colors.neutrals.gray100 },
              showFilters && [
                styles.filterButtonActive,
                { backgroundColor: isDark 
                  ? `${colors.primary[700]}50` 
                  : Colors.primary.blue + '20' 
                }
              ]
            ]}
            onPress={handleFilterPress}
            accessibilityRole="button"
            accessibilityLabel="Filter teams"
            accessibilityState={{ expanded: showFilters }}
          >
            <Feather 
              name="filter" 
              size={20} 
              color={showFilters 
                ? Colors.primary.blue 
                : isDark ? colors.text.secondary : Colors.neutrals.gray700
              } 
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
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : Colors.neutrals.gray100 },
                activeFilter === 'all' && [
                  styles.activeFilterTab,
                  { backgroundColor: isDark 
                    ? `${colors.primary[700]}50` 
                    : Colors.primary.blue + '20'
                  }
                ]
              ]}
              onPress={() => handleFilterSelect('all')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeFilter === 'all' }}
            >
              <Text 
                style={[
                  styles.filterTabText,
                  { color: isDark ? colors.text.secondary : Colors.neutrals.gray700 },
                  activeFilter === 'all' && [
                    styles.activeFilterTabText,
                    { color: Colors.primary.blue }
                  ]
                ]}
              >
                All Teams
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterTab,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : Colors.neutrals.gray100 },
                activeFilter === 'my' && [
                  styles.activeFilterTab,
                  { backgroundColor: isDark 
                    ? `${colors.primary[700]}50` 
                    : Colors.primary.blue + '20'
                  }
                ]
              ]}
              onPress={() => handleFilterSelect('my')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeFilter === 'my' }}
            >
              <Text 
                style={[
                  styles.filterTabText,
                  { color: isDark ? colors.text.secondary : Colors.neutrals.gray700 },
                  activeFilter === 'my' && [
                    styles.activeFilterTabText,
                    { color: Colors.primary.blue }
                  ]
                ]}
              >
                My Teams
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterTab,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : Colors.neutrals.gray100 },
                activeFilter === 'active' && [
                  styles.activeFilterTab,
                  { backgroundColor: isDark 
                    ? `${colors.primary[700]}50` 
                    : Colors.primary.blue + '20'
                  }
                ]
              ]}
              onPress={() => handleFilterSelect('active')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeFilter === 'active' }}
            >
              <Text 
                style={[
                  styles.filterTabText,
                  { color: isDark ? colors.text.secondary : Colors.neutrals.gray700 },
                  activeFilter === 'active' && [
                    styles.activeFilterTabText,
                    { color: Colors.primary.blue }
                  ]
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
        renderSkeletonLoader()
      ) : (
        <>
          <FlatList
            data={filteredTeams}
            renderItem={renderTeamItem}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.teamsList,
              { paddingBottom: insets.bottom + 100 }
            ]}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.primary.blue}
                colors={[Colors.primary.blue]}
                progressBackgroundColor={isDark ? 'rgba(255,255,255,0.1)' : undefined}
              />
            }
          />
          
          <Animated.View style={fabAnimatedStyle}>
            <FAB
              icon="plus"
              onPress={handleCreateTeam}
              position="bottomRight"
              label="New Team"
              extended={false}
              style={[styles.fab, { bottom: insets.bottom + 16 }]}
              gradientColors={[Colors.primary[500], Colors.primary[700]]}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
};

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
    zIndex: 10
  },
  title: {
    fontSize: Typography.sizes.title,
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
    marginBottom: 16
  },
  teamsList: {
    padding: 20,
    paddingBottom: 100
  },
  teamCard: {
    marginBottom: 16
  },
  teamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  teamHeaderContent: {
    flex: 1,
    marginRight: 8
  },
  teamName: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 4
  },
  teamDescription: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    lineHeight: 20
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
    padding: 16
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
    marginBottom: 4
  },
  statLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  newTeamHighlight: {
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
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
    minWidth: 160
  },
  fab: {
    position: 'absolute',
    right: 20,
    zIndex: 100
  }
});

export default TeamsListScreen;