import React, { useState, useEffect, useRef } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  StatusBar,
  Platform,
  RefreshControl
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
  SlideInRight,
  interpolate,
  Extrapolation,
  FadeInDown,
  Layout
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import Svg, { 
  Path, 
  Line, 
  Circle, 
  G, 
  Text as SvgText,
  Rect,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop
} from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

// Import components from our codebase
import Card from '../components/Card'
import Button from '../components/Button/Button'
import SkeletonLoader from '../components/Skeleton/SkeletonLoader'
import FAB from '../components/FAB'
import SegmentedControl from '../components/Controls/SegmentedControl'
import StatusPill from '../components/StatusPill'

// Import themes and utilities
import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import { useTheme } from '../hooks/useColorScheme'
import { triggerImpact } from '../utils/HapticUtils'
import { formatNumber, calculatePercentage } from '../utils/helpers'

const { width } = Dimensions.get('window')
const AnimatedSvg = Animated.createAnimatedComponent(Svg)
const AnimatedCard = Animated.createAnimatedComponent(Card)

// Date range options
const DATE_RANGES = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'quarter', label: 'Quarter' },
  { id: 'year', label: 'Year' }
]

// Analytics metrics types
interface OverviewMetric {
  label: string
  value: number
  change: number
  icon: string
  color: string
}

interface TimeseriesData {
  date: string
  tasks: number
  projects: number
}

interface ProjectProgress {
  id: string
  name: string
  progress: number
  timeSpent: number
}

interface TeamPerformance {
  id: string
  name: string
  tasksCompleted: number
  timeSpent: number
}

const AnalyticsScreen = () => {
  const { colors, isDark } = useTheme()
  const navigation = useNavigation()
  const [dateRange, setDateRange] = useState('month')
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetric[]>([])
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesData[]>([])
  const [projectsData, setProjectsData] = useState<ProjectProgress[]>([])
  const [teamsData, setTeamsData] = useState<TeamPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const insets = useSafeAreaInsets()
  
  // Animated values
  const scrollY = useSharedValue(0)
  const headerHeight = useSharedValue(60 + insets.top)
  const chartProgress = useSharedValue(0)
  const barChartProgress = useSharedValue(0)
  const cardScale = useSharedValue(1)
  const fabOpacity = useSharedValue(1)
  
  // Load analytics data
  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      // Generate metrics data based on selected date range
      generateData(dateRange)
      setIsLoading(false)
      
      // Animate charts with delay
      setTimeout(() => {
        chartProgress.value = withTiming(1, { duration: 1200 })
        barChartProgress.value = withTiming(1, { duration: 1200 })
      }, 300)
    }, 800)
  }, [dateRange])
  
  // Handle refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    
    // Reset chart animations
    chartProgress.value = 0
    barChartProgress.value = 0
    
    // Simulate reload
    setTimeout(() => {
      generateData(dateRange)
      setRefreshing(false)
      
      // Animate charts after refresh
      setTimeout(() => {
        chartProgress.value = withTiming(1, { duration: 1200 })
        barChartProgress.value = withTiming(1, { duration: 1200 })
        triggerImpact(Haptics.ImpactFeedbackStyle.Light)
      }, 300)
    }, 1200)
  }, [dateRange])
  
  // Generate mock data based on date range
  const generateData = (range: string) => {
    // Overview metrics
    const metrics: OverviewMetric[] = [
      {
        label: 'Tasks Completed',
        value: range === 'week' ? 24 : range === 'month' ? 87 : range === 'quarter' ? 246 : 982,
        change: range === 'week' ? 12 : range === 'month' ? 8 : range === 'quarter' ? 15 : 22,
        icon: 'check-square',
        color: colors.primary[500]
      },
      {
        label: 'Active Projects',
        value: range === 'week' ? 5 : range === 'month' ? 8 : range === 'quarter' ? 12 : 18,
        change: range === 'week' ? -1 : range === 'month' ? 2 : range === 'quarter' ? 4 : 7,
        icon: 'briefcase',
        color: colors.secondary[500]
      },
      {
        label: 'Team Members',
        value: range === 'week' ? 14 : range === 'month' ? 16 : range === 'quarter' ? 18 : 22,
        change: range === 'week' ? 0 : range === 'month' ? 2 : range === 'quarter' ? 4 : 8,
        icon: 'users',
        color: '#9C27B0'
      },
      {
        label: 'Hours Logged',
        value: range === 'week' ? 168 : range === 'month' ? 642 : range === 'quarter' ? 1840 : 7320,
        change: range === 'week' ? 24 : range === 'month' ? 86 : range === 'quarter' ? 205 : 1240,
        icon: 'clock',
        color: '#FFC107'
      }
    ]
    
    // Timeseries data
    let timeseries: TimeseriesData[] = []
    
    if (range === 'week') {
      timeseries = [
        { date: 'Mon', tasks: 5, projects: 3 },
        { date: 'Tue', tasks: 8, projects: 4 },
        { date: 'Wed', tasks: 3, projects: 3 },
        { date: 'Thu', tasks: 10, projects: 5 },
        { date: 'Fri', tasks: 7, projects: 4 },
        { date: 'Sat', tasks: 2, projects: 2 },
        { date: 'Sun', tasks: 0, projects: 1 }
      ]
    } else if (range === 'month') {
      // Generate for 4 weeks
      timeseries = [
        { date: 'Week 1', tasks: 18, projects: 6 },
        { date: 'Week 2', tasks: 24, projects: 7 },
        { date: 'Week 3', tasks: 21, projects: 8 },
        { date: 'Week 4', tasks: 28, projects: 8 }
      ]
    } else if (range === 'quarter') {
      // Generate for 3 months
      timeseries = [
        { date: 'Jan', tasks: 72, projects: 8 },
        { date: 'Feb', tasks: 86, projects: 10 },
        { date: 'Mar', tasks: 92, projects: 12 }
      ]
    } else {
      // Generate for 12 months
      timeseries = [
        { date: 'Jan', tasks: 72, projects: 8 },
        { date: 'Feb', tasks: 86, projects: 10 },
        { date: 'Mar', tasks: 92, projects: 12 },
        { date: 'Apr', tasks: 78, projects: 11 },
        { date: 'May', tasks: 84, projects: 12 },
        { date: 'Jun', tasks: 90, projects: 14 },
        { date: 'Jul', tasks: 75, projects: 12 },
        { date: 'Aug', tasks: 68, projects: 10 },
        { date: 'Sep', tasks: 82, projects: 13 },
        { date: 'Oct', tasks: 90, projects: 15 },
        { date: 'Nov', tasks: 85, projects: 15 },
        { date: 'Dec', tasks: 75, projects: 14 }
      ]
    }
    
    // Project progress data
    const projects: ProjectProgress[] = [
      { id: 'p1', name: 'Mobile App Redesign', progress: 0.75, timeSpent: 120 },
      { id: 'p2', name: 'Website Refresh', progress: 0.45, timeSpent: 85 },
      { id: 'p3', name: 'Marketing Campaign', progress: 0.9, timeSpent: 64 },
      { id: 'p4', name: 'Product Launch', progress: 0.3, timeSpent: 42 },
      { id: 'p5', name: 'API Integration', progress: 0.6, timeSpent: 76 }
    ]
    
    // Team performance data
    const teams: TeamPerformance[] = [
      { id: 't1', name: 'Design Team', tasksCompleted: 42, timeSpent: 180 },
      { id: 't2', name: 'Development Team', tasksCompleted: 68, timeSpent: 240 },
      { id: 't3', name: 'Marketing Team', tasksCompleted: 35, timeSpent: 120 },
      { id: 't4', name: 'Product Team', tasksCompleted: 28, timeSpent: 105 }
    ]
    
    setOverviewMetrics(metrics)
    setTimeseriesData(timeseries)
    setProjectsData(projects)
    setTeamsData(teams)
  }
  
  // Handle date range selection
  const handleDateRangeChange = (range: string) => {
    if (range === dateRange) return
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    // Animate card scale
    cardScale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withTiming(1, { duration: 200 })
    )
    
    setDateRange(range)
    setIsLoading(true)
    
    // Reset chart animations
    chartProgress.value = 0
    barChartProgress.value = 0
  }
  
  // Scroll handler for animations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offsetY = event.contentOffset.y
      scrollY.value = offsetY
      
      // Hide/show FAB based on scroll direction
      const scrollingDown = offsetY > 100
      fabOpacity.value = withTiming(scrollingDown ? 0 : 1, { duration: 200 })
    }
  })
  
  // Line chart rendering functions
  const getLineChartPoints = (data: TimeseriesData[]): string => {
    if (!data.length) return ''
    
    const maxTasks = Math.max(...data.map(d => d.tasks))
    const pointWidth = width - 64 // Full width minus padding
    const segmentWidth = pointWidth / (data.length - 1)
    const height = 200
    
    return data.map((d, i) => {
      const x = i * segmentWidth + 32
      const y = height - (d.tasks / maxTasks) * height + 40
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }
  
  const renderLineChart = () => {
    if (!timeseriesData.length) return null
    
    const maxTasks = Math.max(...timeseriesData.map(d => d.tasks))
    const maxProjects = Math.max(...timeseriesData.map(d => d.projects))
    
    const pointWidth = width - 64
    const segmentWidth = pointWidth / (timeseriesData.length - 1)
    const chartHeight = 200
    
    // Animated path for tasks line
    const animatedTasksPath = useAnimatedStyle(() => {
      const progress = chartProgress.value
      
      return {
        opacity: progress,
        strokeDashoffset: withTiming(0, { duration: 1500 })
      }
    })
    
    // Animated circles for data points
    const animatedCircles = timeseriesData.map((d, i) => {
      const x = i * segmentWidth + 32
      const y = chartHeight - (d.tasks / maxTasks) * chartHeight + 40
      
      return useAnimatedStyle(() => {
        const progress = chartProgress.value
        const delay = i * 100
        
        return {
          opacity: withDelay(
            delay,
            withTiming(progress, { duration: 300 })
          ),
          transform: [
            { scale: withDelay(delay, withTiming(progress, { duration: 300 })) }
          ]
        }
      })
    })
    
    return (
      <Card
        style={styles.chartContainer}
        animationType="none"
        elevation={isDark ? 1 : 2}
      >
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Tasks Completion</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.primary[500] }]} />
              <Text style={styles.legendText}>Tasks</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: isDark ? colors.neutrals[700] : colors.neutrals[300] }]} />
              <Text style={styles.legendText}>Projects</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.chartContent}>
          <AnimatedSvg height={chartHeight + 80} width={width}>
            {/* Y-axis grid lines */}
            <Line
              x1="32"
              y1="40"
              x2="32"
              y2={chartHeight + 40}
              stroke={isDark ? colors.neutrals[700] : colors.neutrals[300]}
              strokeWidth="1"
            />
            <Line
              x1="32"
              y1={chartHeight * 0.25 + 40}
              x2={width - 32}
              y2={chartHeight * 0.25 + 40}
              stroke={isDark ? colors.neutrals[800] : colors.neutrals[200]}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <Line
              x1="32"
              y1={chartHeight * 0.5 + 40}
              x2={width - 32}
              y2={chartHeight * 0.5 + 40}
              stroke={isDark ? colors.neutrals[800] : colors.neutrals[200]}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <Line
              x1="32"
              y1={chartHeight * 0.75 + 40}
              x2={width - 32}
              y2={chartHeight * 0.75 + 40}
              stroke={isDark ? colors.neutrals[800] : colors.neutrals[200]}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <Line
              x1="32"
              y1={chartHeight + 40}
              x2={width - 32}
              y2={chartHeight + 40}
              stroke={isDark ? colors.neutrals[700] : colors.neutrals[300]}
              strokeWidth="1"
            />
            
            {/* Y-axis labels */}
            <SvgText
              x="20"
              y={chartHeight + 45}
              textAnchor="end"
              fill={isDark ? colors.text.secondary : colors.neutrals[600]}
              fontSize="10"
            >
              0
            </SvgText>
            <SvgText
              x="20"
              y={chartHeight * 0.75 + 45}
              textAnchor="end"
              fill={isDark ? colors.text.secondary : colors.neutrals[600]}
              fontSize="10"
            >
              {Math.round(maxTasks * 0.25)}
            </SvgText>
            <SvgText
              x="20"
              y={chartHeight * 0.5 + 45}
              textAnchor="end"
              fill={isDark ? colors.text.secondary : colors.neutrals[600]}
              fontSize="10"
            >
              {Math.round(maxTasks * 0.5)}
            </SvgText>
            <SvgText
              x="20"
              y={chartHeight * 0.25 + 45}
              textAnchor="end"
              fill={isDark ? colors.text.secondary : colors.neutrals[600]}
              fontSize="10"
            >
              {Math.round(maxTasks * 0.75)}
            </SvgText>
            <SvgText
              x="20"
              y="45"
              textAnchor="end"
              fill={isDark ? colors.text.secondary : colors.neutrals[600]}
              fontSize="10"
            >
              {maxTasks}
            </SvgText>
            
            {/* X-axis labels */}
            {timeseriesData.map((d, i) => (
              <SvgText
                key={`label-${i}`}
                x={i * segmentWidth + 32}
                y={chartHeight + 65}
                textAnchor="middle"
                fill={isDark ? colors.text.secondary : colors.neutrals[600]}
                fontSize="10"
              >
                {d.date}
              </SvgText>
            ))}
            
            {/* Gradient definition for the area under the line */}
            <Defs>
              <SvgLinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.primary[500]} stopOpacity="0.3" />
                <Stop offset="1" stopColor={colors.primary[500]} stopOpacity="0.05" />
              </SvgLinearGradient>
            </Defs>
            
            {/* Area under the line */}
            <Animated.View style={[StyleSheet.absoluteFill, animatedTasksPath]}>
              <Path
                d={`${getLineChartPoints(timeseriesData)} L ${width - 32} ${chartHeight + 40} L 32 ${chartHeight + 40} Z`}
                fill="url(#areaGradient)"
              />
            </Animated.View>
            
            {/* Line for tasks */}
            <Animated.View style={[StyleSheet.absoluteFill, animatedTasksPath]}>
              <Path
                d={getLineChartPoints(timeseriesData)}
                stroke={colors.primary[500]}
                strokeWidth="3"
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray="1000"
                strokeDashoffset="1000"
              />
            </Animated.View>
            
            {/* Data points */}
            {timeseriesData.map((d, i) => {
              const x = i * segmentWidth + 32
              const y = chartHeight - (d.tasks / maxTasks) * chartHeight + 40
              
              return (
                <Animated.View 
                  key={`point-${i}`}
                  style={[
                    {
                      position: 'absolute',
                      left: x - 6,
                      top: y - 6
                    },
                    animatedCircles[i]
                  ]}
                >
                  <Circle
                    cx="6"
                    cy="6"
                    r="6"
                    fill={isDark ? colors.card.background : colors.neutrals.white}
                    stroke={colors.primary[500]}
                    strokeWidth="2"
                  />
                </Animated.View>
              )
            })}
          </AnimatedSvg>
        </View>
      </Card>
    )
  }
  
  // Render bar chart for project progress
  const renderProjectsChart = () => {
    const barChartHeight = 200
    const barWidth = (width - 90) / projectsData.length
    
    // Animated bars
    const animatedBars = projectsData.map((project, i) => {
      return useAnimatedStyle(() => {
        const progress = barChartProgress.value
        const delay = i * 100
        
        return {
          height: barChartHeight * project.progress * progress,
          opacity: withDelay(delay, withTiming(1, { duration: 300 }))
        }
      })
    })
    
    return (
      <Card
        style={styles.chartContainer}
        animationType="none"
        elevation={isDark ? 1 : 2}
      >
        <Text style={styles.chartTitle}>Project Progress</Text>
        
        <View style={styles.barChartContainer}>
          {projectsData.map((project, i) => (
            <View key={project.id} style={styles.barColumn}>
              <Animated.View 
                style={[
                  styles.bar,
                  { width: barWidth - 10 },
                  getBarColorStyle(project.progress),
                  animatedBars[i]
                ]}
              />
              <Text style={styles.barLabel} numberOfLines={1}>
                {project.name}
              </Text>
              <StatusPill 
                label={`${Math.round(project.progress * 100)}%`}
                type={project.progress < 0.3 ? 'error' : project.progress < 0.7 ? 'warning' : 'success'}
                small
              />
            </View>
          ))}
        </View>
      </Card>
    )
  }
  
  // Render polar area chart for team performance
  const renderTeamPerformanceChart = () => {
    const maxTasks = Math.max(...teamsData.map(t => t.tasksCompleted))
    const maxTime = Math.max(...teamsData.map(t => t.timeSpent))
    const radius = 100
    const centerX = width / 2
    const centerY = radius + 40
    const angleStep = (2 * Math.PI) / teamsData.length
    
    // Calculate points for each team
    const teamPoints = teamsData.map((team, i) => {
      const angle = i * angleStep - Math.PI / 2
      const taskRadius = (team.tasksCompleted / maxTasks) * radius
      
      return {
        x: centerX + taskRadius * Math.cos(angle),
        y: centerY + taskRadius * Math.sin(angle),
        angle,
        teamName: team.name,
        color: getTeamColor(i),
        tasksCompleted: team.tasksCompleted
      }
    })
    
    // Calculate radar chart path
    const radarPath = teamPoints.map((point, i) => {
      return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    }).join(' ') + ' Z'
    
    // Animated chart
    const animatedRadarPath = useAnimatedStyle(() => {
      const progress = barChartProgress.value
      
      return {
        opacity: progress,
        transform: [{ scale: progress }]
      }
    })
    
    const animatedPoints = teamPoints.map((point, i) => {
      return useAnimatedStyle(() => {
        const progress = barChartProgress.value
        const delay = i * 150
        
        return {
          opacity: withDelay(delay, withTiming(progress, { duration: 300 })),
          transform: [
            { scale: withDelay(delay, withTiming(progress, { duration: 300 })) }
          ]
        }
      })
    })
    
    return (
      <Card
        style={styles.chartContainer}
        animationType="none"
        elevation={isDark ? 1 : 2}
      >
        <Text style={styles.chartTitle}>Team Performance</Text>
        
        <View style={styles.radarChartContainer}>
          <Svg height={radius * 2 + 80} width={width}>
            {/* Background circles */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke={isDark ? colors.neutrals[700] : colors.neutrals[200]}
              strokeWidth="1"
            />
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.75}
              fill="none"
              stroke={isDark ? colors.neutrals[800] : colors.neutrals[200]}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.5}
              fill="none"
              stroke={isDark ? colors.neutrals[800] : colors.neutrals[200]}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.25}
              fill="none"
              stroke={isDark ? colors.neutrals[800] : colors.neutrals[200]}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            
            {/* Axis lines */}
            {teamPoints.map((point, i) => (
              <Line
                key={`axis-${i}`}
                x1={centerX}
                y1={centerY}
                x2={centerX + radius * Math.cos(point.angle)}
                y2={centerY + radius * Math.sin(point.angle)}
                stroke={isDark ? colors.neutrals[700] : colors.neutrals[300]}
                strokeWidth="1"
              />
            ))}
            
            {/* Team labels */}
            {teamPoints.map((point, i) => {
              const labelX = centerX + (radius + 20) * Math.cos(point.angle)
              const labelY = centerY + (radius + 20) * Math.sin(point.angle)
              
              return (
                <SvgText
                  key={`label-${i}`}
                  x={labelX}
                  y={labelY}
                  fill={point.color}
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor={
                    point.angle === -Math.PI / 2 ? 'middle' :
                    point.angle < -Math.PI / 2 || point.angle > Math.PI / 2 ? 'end' : 'start'
                  }
                  alignmentBaseline="central"
                >
                  {point.teamName}
                </SvgText>
              )
            })}
            
            {/* Radar chart fill */}
            <Animated.View style={[StyleSheet.absoluteFill, animatedRadarPath]}>
              <Path
                d={radarPath}
                fill={`${colors.primary[500]}20`}
                stroke={colors.primary[500]}
                strokeWidth="2"
              />
            </Animated.View>
            
            {/* Data points */}
            {teamPoints.map((point, i) => (
              <Animated.View 
                key={`point-${i}`}
                style={[
                  {
                    position: 'absolute',
                    left: point.x - 6,
                    top: point.y - 6
                  },
                  animatedPoints[i]
                ]}
              >
                <G>
                  <Circle
                    cx="6"
                    cy="6"
                    r="6"
                    fill={isDark ? colors.card.background : colors.neutrals.white}
                    stroke={point.color}
                    strokeWidth="2"
                  />
                  <SvgText
                    x="6"
                    y="20"
                    textAnchor="middle"
                    fill={isDark ? colors.text.secondary : colors.neutrals[700]}
                    fontSize="9"
                  >
                    {point.tasksCompleted}
                  </SvgText>
                </G>
              </Animated.View>
            ))}
          </Svg>
        </View>
      </Card>
    )
  }
  
  // Helper function to get color based on progress
  const getBarColorStyle = (progress: number) => {
    if (progress < 0.3) {
      return { backgroundColor: colors.error[500] }
    } else if (progress < 0.7) {
      return { backgroundColor: colors.warning[500] }
    } else {
      return { backgroundColor: colors.success[500] }
    }
  }
  
  // Helper function to get color for team
  const getTeamColor = (index: number) => {
    const colors = [
      '#4CAF50', // Green
      '#F44336', // Red
      '#9C27B0', // Purple
      '#2196F3', // Blue
      '#FF9800'  // Orange
    ]
    
    return colors[index % colors.length]
  }
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const elevation = interpolate(
      scrollY.value,
      [0, 20],
      [0, 8],
      Extrapolation.CLAMP
    )
    
    return {
      elevation,
      shadowOpacity: interpolate(
        scrollY.value,
        [0, 20],
        [0, 0.2],
        Extrapolation.CLAMP
      ),
      borderBottomWidth: interpolate(
        scrollY.value,
        [0, 20],
        [0, 1],
        Extrapolation.CLAMP
      ),
      backgroundColor: isDark 
        ? interpolateColor(
            scrollY.value, 
            [0, 20], 
            [colors.background.dark, colors.card.background]
          ) 
        : interpolateColor(
            scrollY.value, 
            [0, 20], 
            [colors.background.light, colors.neutrals.white]
          )
    }
  })
  
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }]
    }
  })
  
  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fabOpacity.value,
      transform: [
        { scale: fabOpacity.value },
        { translateY: interpolate(
            fabOpacity.value,
            [0, 1],
            [20, 0],
            Extrapolation.CLAMP
          )}
      ]
    }
  })
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDark ? colors.background.dark : colors.background.light }
    ]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent
      />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            paddingTop: insets.top + Spacing.md,
            borderBottomColor: isDark ? colors.card.border : colors.neutrals[200],
          },
          headerAnimatedStyle
        ]}
      >
        <Text style={[
          styles.title,
          { color: isDark ? colors.text.primary : colors.neutrals[900] }
        ]}>
          Analytics
        </Text>
        
        <SegmentedControl 
          segments={DATE_RANGES}
          selectedId={dateRange}
          onChange={handleDateRangeChange}
          style={styles.dateRangeSelector}
          primaryColor={colors.primary[500]}
          secondaryColor={isDark ? colors.neutrals[600] : colors.neutrals[500]}
        />
      </Animated.View>
      
      {/* Scrollable content */}
      <Animated.ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        {/* Overview Metrics */}
        <Animated.View 
          style={[styles.overviewContainer, cardAnimatedStyle]}
        >
          {isLoading ? (
            // Loading state
            <View style={styles.overviewGrid}>
              {[1, 2, 3, 4].map(i => (
                <SkeletonLoader.Card key={i} style={styles.metricCardSkeleton} />
              ))}
            </View>
          ) : (
            <View style={styles.overviewGrid}>
              {overviewMetrics.map((metric, index) => (
                <Animated.View 
                  key={metric.label}
                  entering={FadeInDown.delay(index * 100).duration(500)}
                >
                  <Card 
                    style={styles.metricCard} 
                    elevation={isDark ? 1 : 2}
                    onPress={() => {
                      triggerImpact(Haptics.ImpactFeedbackStyle.Light)
                    }}
                    animationType="spring"
                  >
                    <View 
                      style={[
                        styles.metricIconContainer, 
                        { backgroundColor: metric.color + '20' }
                      ]}
                    >
                      <Feather name={metric.icon} size={20} color={metric.color} />
                    </View>
                    <Text style={[styles.metricLabel, { color: isDark ? colors.text.secondary : colors.neutrals[600] }]}>
                      {metric.label}
                    </Text>
                    <Text style={[styles.metricValue, { color: isDark ? colors.text.primary : colors.neutrals[900] }]}>
                      {formatNumber(metric.value)}
                    </Text>
                    <View style={styles.metricChangeContainer}>
                      <Feather 
                        name={metric.change >= 0 ? 'arrow-up' : 'arrow-down'} 
                        size={12} 
                        color={metric.change >= 0 ? colors.success[500] : colors.error[500]} 
                      />
                      <Text
                        style={[
                          styles.metricChangeText,
                          { 
                            color: metric.change >= 0 ? 
                              colors.success[500] : 
                              colors.error[500] 
                          }
                        ]}
                      >
                        {Math.abs(metric.change)}%
                      </Text>
                    </View>
                  </Card>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
        
        {/* Charts */}
        {isLoading ? (
          <View style={styles.chartsSkeleton}>
            <SkeletonLoader.Card style={styles.chartSkeleton} />
            <SkeletonLoader.Card style={styles.chartSkeleton} />
          </View>
        ) : (
          <View style={styles.chartsContainer}>
            {renderLineChart()}
            {renderProjectsChart()}
            {renderTeamPerformanceChart()}
          </View>
        )}
        
        {/* Export options */}
        <Card
          style={styles.exportContainer}
          elevation={isDark ? 1 : 2}
          animationType="none"
        >
          <Text style={[styles.exportTitle, { color: isDark ? colors.text.primary : colors.neutrals[900] }]}>
            Export Analytics
          </Text>
          <View style={styles.exportOptions}>
            <Button
              title="PDF Report"
              icon="file-text"
              variant="secondary"
              size="small"
              onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
              style={styles.exportButton}
            />
            <Button
              title="CSV Data"
              icon="file"
              variant="secondary"
              size="small"
              onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
              style={styles.exportButton}
            />
          </View>
        </Card>
      </Animated.ScrollView>
      
      {/* Floating action button */}
      <Animated.View style={fabAnimatedStyle}>
        <FAB
          icon="share"
          onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Medium)}
          gradientColors={[colors.primary[500], colors.primary[700]]}
          style={styles.fab}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.background.light,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    zIndex: 10
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md
  },
  dateRangeSelector: {
    marginTop: Spacing.sm
  },
  scrollContainer: {
    flex: 1
  },
  scrollContent: {
    padding: Spacing.lg
  },
  overviewContainer: {
    marginBottom: Spacing.lg
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6
  },
  metricCard: {
    padding: Spacing.md,
    width: (width - 52) / 2,
    marginHorizontal: 6,
    marginBottom: 12,
    borderRadius: 16
  },
  metricCardSkeleton: {
    height: 150,
    width: (width - 52) / 2,
    marginHorizontal: 6,
    marginBottom: 12
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  metricLabel: {
    fontSize: Typography.sizes.bodySmall,
    marginBottom: Spacing.xs
  },
  metricValue: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs
  },
  metricChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  metricChangeText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    marginLeft: 4
  },
  chartsSkeleton: {
    marginBottom: Spacing.xl
  },
  chartSkeleton: {
    height: 300,
    marginBottom: Spacing.md
  },
  chartsContainer: {
    marginBottom: Spacing.xl
  },
  chartContainer: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 16
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  chartTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md
  },
  chartLegend: {
    flexDirection: 'row'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4
  },
  legendText: {
    fontSize: Typography.sizes.caption
  },
  chartContent: {
    height: 280
  },
  barChartContainer: {
    height: 240,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 40
  },
  barColumn: {
    alignItems: 'center',
    flex: 1
  },
  bar: {
    borderRadius: 8,
    width: 30,
    maxWidth: 50
  },
  barLabel: {
    fontSize: Typography.sizes.caption,
    marginTop: Spacing.xs,
    textAlign: 'center',
    width: '100%',
    marginBottom: Spacing.xs
  },
  radarChartContainer: {
    height: 280,
    alignItems: 'center'
  },
  exportContainer: {
    padding: Spacing.lg,
    borderRadius: 16
  },
  exportTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md
  },
  exportOptions: {
    flexDirection: 'row'
  },
  exportButton: {
    marginRight: Spacing.md
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20
  }
})

export default AnalyticsScreen