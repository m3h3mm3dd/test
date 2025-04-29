import React, { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  StatusBar
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeInDown,
  FadeInRight
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import Card from '../components/Card'
import SegmentedControl from '../components/Controls/SegmentedControl'
import SkeletonLoader from '../components/SkeletonLoader'
import { triggerImpact } from '../utils/HapticUtils'

const { width } = Dimensions.get('window')
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

// Time filter options
const TIME_FILTERS = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'quarter', label: 'Quarter' },
  { id: 'year', label: 'Year' }
]

const AnalyticsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  
  // State
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('week')
  const [activeTab, setActiveTab] = useState('performance')
  
  // Animation values
  const chartProgress = useSharedValue(0)
  
  // Load data
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false)
      
      // Animate charts
      chartProgress.value = withTiming(1, { duration: 1500 })
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Handle tab change
  const handleTabChange = (tab) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    setActiveTab(tab)
    
    // Reset and restart chart animation
    chartProgress.value = 0
    chartProgress.value = withTiming(1, { duration: 1500 })
  }
  
  // Animated chart style
  const chartAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: chartProgress.value,
      transform: [
        { 
          translateY: withSpring(chartProgress.value * 0, {
            damping: 20,
            stiffness: 90
          })
        }
      ]
    }
  })
  
  // Performance data
  const performanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
        color: () => Colors.primary.blue,
        strokeWidth: 2
      }
    ],
    legend: ['Tasks Completed']
  }
  
  // Projects data
  const projectsData = {
    labels: ['Mobile App', 'Website', 'Marketing', 'Research', 'Backend'],
    data: [0.4, 0.6, 0.8, 0.2, 0.5]
  }
  
  // Team data
  const teamData = {
    labels: ['Alex', 'Morgan', 'Jamie', 'Taylor', 'Jordan'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99],
        color: () => `rgba(61, 90, 254, 0.8)`,
        strokeWidth: 2
      }
    ],
    legend: ['Tasks Completed']
  }
  
  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(61, 90, 254, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: () => Colors.neutrals.gray600,
    propsForLabels: {
      fontSize: 12
    }
  }
  
  // Pie chart data
  const pieData = [
    {
      name: 'Completed',
      value: 65,
      color: Colors.secondary.green,
      legendFontColor: Colors.neutrals.gray700,
      legendFontSize: 12
    },
    {
      name: 'In Progress',
      value: 25,
      color: Colors.primary.blue,
      legendFontColor: Colors.neutrals.gray700,
      legendFontSize: 12
    },
    {
      name: 'To Do',
      value: 10,
      color: Colors.neutrals.gray400,
      legendFontColor: Colors.neutrals.gray700,
      legendFontSize: 12
    }
  ]
  
  // Render performance tab
  const renderPerformanceTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Tasks Completed</Text>
        <Text style={styles.chartSubtitle}>Last 7 days</Text>
        
        <Animated.View style={[styles.chart, chartAnimatedStyle]}>
          <LineChart
            data={performanceData}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
          />
        </Animated.View>
      </View>
      
      <View style={styles.statsCards}>
        <Animated.View 
          style={styles.statsCard}
          entering={FadeInDown.delay(300).duration(500)}
        >
          <Text style={styles.statsTitle}>Today</Text>
          <Text style={styles.statsValue}>12</Text>
          <Text style={styles.statsLabel}>Tasks completed</Text>
          
          <View style={styles.statsChange}>
            <Feather name="arrow-up-right" size={14} color={Colors.secondary.green} />
            <Text style={[styles.statsChangeText, styles.statsPositive]}>+20%</Text>
          </View>
        </Animated.View>
        
        <Animated.View 
          style={styles.statsCard}
          entering={FadeInDown.delay(400).duration(500)}
        >
          <Text style={styles.statsTitle}>Weekly</Text>
          <Text style={styles.statsValue}>43</Text>
          <Text style={styles.statsLabel}>Tasks completed</Text>
          
          <View style={styles.statsChange}>
            <Feather name="arrow-up-right" size={14} color={Colors.secondary.green} />
            <Text style={[styles.statsChangeText, styles.statsPositive]}>+12%</Text>
          </View>
        </Animated.View>
      </View>
      
      <Animated.View 
        style={styles.pieChartCard}
        entering={FadeInDown.delay(500).duration(500)}
      >
        <Text style={styles.chartTitle}>Tasks by Status</Text>
        <Animated.View style={[styles.pieChart, chartAnimatedStyle]}>
          <PieChart
            data={pieData}
            width={width - 32}
            height={200}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Animated.View>
      </Animated.View>
    </View>
  )
  
  // Render projects tab
  const renderProjectsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Project Completion</Text>
        <Text style={styles.chartSubtitle}>% completion per project</Text>
        
        <Animated.View style={[styles.chart, chartAnimatedStyle]}>
          <BarChart
            data={projectsData}
            width={width - 32}
            height={220}
            chartConfig={{
              ...chartConfig,
              barPercentage: 0.6,
              decimalPlaces: 1,
              formatYLabel: (value) => `${value * 100}%`
            }}
            withHorizontalLabels={true}
            fromZero
            showValuesOnTopOfBars
            style={styles.chartStyle}
          />
        </Animated.View>
      </View>
      
      <Animated.View 
        style={styles.projectsList}
        entering={FadeInDown.delay(300).duration(500)}
      >
        <Text style={styles.sectionTitle}>Top Projects</Text>
        
        <Card style={styles.projectCard}>
          <View style={styles.projectCardContent}>
            <View style={styles.projectHeader}>
              <View style={[styles.projectDot, { backgroundColor: Colors.primary.blue }]} />
              <Text style={styles.projectName}>Mobile App Redesign</Text>
              <Text style={styles.projectPercent}>80%</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '80%', backgroundColor: Colors.primary.blue }]} />
            </View>
          </View>
        </Card>
        
        <Card style={styles.projectCard}>
          <View style={styles.projectCardContent}>
            <View style={styles.projectHeader}>
              <View style={[styles.projectDot, { backgroundColor: Colors.secondary.green }]} />
              <Text style={styles.projectName}>Website Development</Text>
              <Text style={styles.projectPercent}>60%</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%', backgroundColor: Colors.secondary.green }]} />
            </View>
          </View>
        </Card>
        
        <Card style={styles.projectCard}>
          <View style={styles.projectCardContent}>
            <View style={styles.projectHeader}>
              <View style={[styles.projectDot, { backgroundColor: '#9C27B0' }]} />
              <Text style={styles.projectName}>Marketing Campaign</Text>
              <Text style={styles.projectPercent}>45%</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '45%', backgroundColor: '#9C27B0' }]} />
            </View>
          </View>
        </Card>
      </Animated.View>
    </View>
  )
  
  // Render team tab
  const renderTeamTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Team Performance</Text>
        <Text style={styles.chartSubtitle}>Tasks completed by team member</Text>
        
        <Animated.View style={[styles.chart, chartAnimatedStyle]}>
          <BarChart
            data={teamData}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            style={styles.chartStyle}
            showValuesOnTopOfBars
          />
        </Animated.View>
      </View>
      
      <Animated.View 
        style={styles.teamList}
        entering={FadeInDown.delay(300).duration(500)}
      >
        <Text style={styles.sectionTitle}>Top Performers</Text>
        
        <Card style={styles.teamCard}>
          <View style={styles.teamCardContent}>
            <View style={styles.teamMember}>
              <View style={styles.teamMemberCircle}>
                <Text style={styles.teamMemberInitials}>MS</Text>
              </View>
              <View style={styles.teamMemberInfo}>
                <Text style={styles.teamMemberName}>Morgan Smith</Text>
                <Text style={styles.teamMemberRole}>UI Designer</Text>
              </View>
            </View>
            
            <View style={styles.teamStats}>
              <View style={styles.teamStat}>
                <Text style={styles.teamStatValue}>45</Text>
                <Text style={styles.teamStatLabel}>Tasks</Text>
              </View>
              <View style={styles.teamStat}>
                <Text style={styles.teamStatValue}>98%</Text>
                <Text style={styles.teamStatLabel}>On Time</Text>
              </View>
            </View>
          </View>
        </Card>
        
        <Card style={styles.teamCard}>
          <View style={styles.teamCardContent}>
            <View style={styles.teamMember}>
              <View style={[styles.teamMemberCircle, { backgroundColor: 'rgba(0, 200, 83, 0.2)' }]}>
                <Text style={[styles.teamMemberInitials, { color: Colors.secondary.green }]}>JP</Text>
              </View>
              <View style={styles.teamMemberInfo}>
                <Text style={styles.teamMemberName}>Jamie Parker</Text>
                <Text style={styles.teamMemberRole}>Developer</Text>
              </View>
            </View>
            
            <View style={styles.teamStats}>
              <View style={styles.teamStat}>
                <Text style={styles.teamStatValue}>38</Text>
                <Text style={styles.teamStatLabel}>Tasks</Text>
              </View>
              <View style={styles.teamStat}>
                <Text style={styles.teamStatValue}>92%</Text>
                <Text style={styles.teamStatLabel}>On Time</Text>
              </View>
            </View>
          </View>
        </Card>
        
        <Card style={styles.teamCard}>
          <View style={styles.teamCardContent}>
            <View style={styles.teamMember}>
              <View style={[styles.teamMemberCircle, { backgroundColor: 'rgba(156, 39, 176, 0.2)' }]}>
                <Text style={[styles.teamMemberInitials, { color: '#9C27B0' }]}>AJ</Text>
              </View>
              <View style={styles.teamMemberInfo}>
                <Text style={styles.teamMemberName}>Alex Johnson</Text>
                <Text style={styles.teamMemberRole}>Project Manager</Text>
              </View>
            </View>
            
            <View style={styles.teamStats}>
              <View style={styles.teamStat}>
                <Text style={styles.teamStatValue}>32</Text>
                <Text style={styles.teamStatLabel}>Tasks</Text>
              </View>
              <View style={styles.teamStat}>
                <Text style={styles.teamStatValue}>95%</Text>
                <Text style={styles.teamStatLabel}>On Time</Text>
              </View>
            </View>
          </View>
        </Card>
      </Animated.View>
    </View>
  )
  
  // Render current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'performance':
        return renderPerformanceTab()
      case 'projects':
        return renderProjectsTab()
      case 'team':
        return renderTeamTab()
      default:
        return renderPerformanceTab()
    }
  }
  
  // Render loading skeleton
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <SkeletonLoader width={width - 32} height={220} style={styles.loadingSkeleton} />
      <View style={styles.loadingStatsContainer}>
        <SkeletonLoader width={(width - 40) / 2} height={120} style={styles.loadingStat} />
        <SkeletonLoader width={(width - 40) / 2} height={120} style={styles.loadingStat} />
      </View>
      <SkeletonLoader width={width - 32} height={200} style={styles.loadingSkeleton} />
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.blue} />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary.darkBlue, Colors.primary.blue]}
        style={[styles.header, { paddingTop: insets.top }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={styles.headerContent}
          entering={FadeInDown.delay(100).duration(500)}
        >
          <Text style={styles.title}>Analytics</Text>
          
          <View style={styles.filterContainer}>
            <SegmentedControl
              segments={TIME_FILTERS}
              selectedId={timeFilter}
              onChange={setTimeFilter}
              primaryColor={Colors.neutrals.white}
              secondaryColor="rgba(255, 255, 255, 0.6)"
            />
          </View>
        </Animated.View>
      </LinearGradient>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'performance' && styles.activeTab
          ]}
          onPress={() => handleTabChange('performance')}
        >
          <Feather
            name="activity"
            size={20}
            color={activeTab === 'performance' ? Colors.primary.blue : Colors.neutrals.gray600}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'performance' && styles.activeTabText
            ]}
          >
            Performance
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'projects' && styles.activeTab
          ]}
          onPress={() => handleTabChange('projects')}
        >
          <Feather
            name="folder"
            size={20}
            color={activeTab === 'projects' ? Colors.primary.blue : Colors.neutrals.gray600}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'projects' && styles.activeTabText
            ]}
          >
            Projects
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'team' && styles.activeTab
          ]}
          onPress={() => handleTabChange('team')}
        >
          <Feather
            name="users"
            size={20}
            color={activeTab === 'team' ? Colors.primary.blue : Colors.neutrals.gray600}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'team' && styles.activeTabText
            ]}
          >
            Team
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <AnimatedScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? renderLoading() : renderTabContent()}
      </AnimatedScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg
  },
  headerContent: {
    marginTop: Spacing.md
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginBottom: Spacing.md
  },
  filterContainer: {
    marginBottom: Spacing.md
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutrals.white,
    paddingVertical: Spacing.sm,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm
  },
  activeTab: {
    backgroundColor: 'rgba(61, 90, 254, 0.1)'
  },
  tabButtonText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray600,
    marginLeft: 6
  },
  activeTabText: {
    color: Colors.primary.blue
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: 40
  },
  loadingContainer: {
    flex: 1
  },
  loadingSkeleton: {
    marginBottom: Spacing.md,
    borderRadius: 8
  },
  loadingStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md
  },
  loadingStat: {
    borderRadius: 8
  },
  tabContent: {
    flex: 1
  },
  chartCard: {
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  chartTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 4
  },
  chartSubtitle: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginBottom: Spacing.md
  },
  chart: {
    alignItems: 'center'
  },
  chartStyle: {
    borderRadius: 8,
    marginTop: Spacing.md
  },
  statsCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg
  },
  statsCard: {
    width: '48%',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  statsTitle: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginBottom: Spacing.xs
  },
  statsValue: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginBottom: 2
  },
  statsLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    marginBottom: Spacing.xs
  },
  statsChange: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statsChangeText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    marginLeft: 2
  },
  statsPositive: {
    color: Colors.secondary.green
  },
  statsNegative: {
    color: Colors.secondary.red
  },
  pieChartCard: {
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  pieChart: {
    alignItems: 'center',
    marginTop: Spacing.md
  },
  projectsList: {
    marginTop: Spacing.md
  },
  sectionTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: Spacing.md
  },
  projectCard: {
    marginBottom: Spacing.md
  },
  projectCardContent: {
    padding: Spacing.md
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  projectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  projectName: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray900,
    flex: 1
  },
  projectPercent: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray700
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  teamList: {
    marginTop: Spacing.md
  },
  teamCard: {
    marginBottom: Spacing.md
  },
  teamCardContent: {
    padding: Spacing.md
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  teamMemberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(61, 90, 254, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md
  },
  teamMemberInitials: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.bold,
    color: Colors.primary.blue
  },
  teamMemberInfo: {
    flex: 1
  },
  teamMemberName: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 2
  },
  teamMemberRole: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  teamStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.neutrals.gray200,
    paddingTop: Spacing.sm
  },
  teamStat: {
    flex: 1,
    alignItems: 'center'
  },
  teamStatValue: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.bold,
    color: Colors.primary.blue,
    marginBottom: 2
  },
  teamStatLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  }
})

export default AnalyticsScreen