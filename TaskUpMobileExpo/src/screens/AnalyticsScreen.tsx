import React, { useState, useEffect, useRef } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  StatusBar,
  SafeAreaView
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  withSequence,
  FadeIn,
  SlideInRight,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
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
import * as Haptics from 'expo-haptics'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import { triggerImpact } from '../utils/HapticUtils'

const { width, height } = Dimensions.get('window')
const AnimatedSvg = Animated.createAnimatedComponent(Svg)

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

const AnalyticsScreen = ({ navigation }) => {
  const [dateRange, setDateRange] = useState('month')
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetric[]>([])
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesData[]>([])
  const [projectsData, setProjectsData] = useState<ProjectProgress[]>([])
  const [teamsData, setTeamsData] = useState<TeamPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const insets = useSafeAreaInsets()
  
  // Animated values
  const scrollY = useSharedValue(0)
  const headerHeight = useSharedValue(60 + insets.top)
  const chartProgress = useSharedValue(0)
  const barChartProgress = useSharedValue(0)
  
  // Load analytics data
  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      // Generate metrics data based on selected date range
      generateData(dateRange)
      setIsLoading(false)
      
      // Animate charts
      chartProgress.value = withTiming(1, { duration: 1500 })
      barChartProgress.value = withTiming(1, { duration: 1500 })
    }, 1000)
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
        color: Colors.primary.blue
      },
      {
        label: 'Active Projects',
        value: range === 'week' ? 5 : range === 'month' ? 8 : range === 'quarter' ? 12 : 18,
        change: range === 'week' ? -1 : range === 'month' ? 2 : range === 'quarter' ? 4 : 7,
        icon: 'briefcase',
        color: Colors.secondary.green
      },
      {
        label: 'Team Members',
        value: range === 'week' ? 14 : range === 'month' ? 16 : range === 'quarter' ? 18 : 22,
        change: range === 'week' ? 0 : range === 'month' ? 2 : range === 'quarter' ? 4 : 8,
        icon: 'users',
        color: Colors.primary.purple
      },
      {
        label: 'Hours Logged',
        value: range === 'week' ? 168 : range === 'month' ? 642 : range === 'quarter' ? 1840 : 7320,
        change: range === 'week' ? 24 : range === 'month' ? 86 : range === 'quarter' ? 205 : 1240,
        icon: 'clock',
        color: Colors.primary.yellow
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
    
    triggerImpact()
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
    }
  })
  
  // Format number with commas and abbreviations
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }
  
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
          opacity: withTiming(progress, { duration: 300 }, (finished) => {
            if (finished) {
              return withTiming(1, { duration: 300 })
            }
          }),
          transform: [
            { scale: withTiming(progress, { duration: 300 + delay }) }
          ]
        }
      })
    })
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Tasks Completion</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: Colors.primary.blue }]} />
              <Text style={styles.legendText}>Tasks</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#E0E0E0' }]} />
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
              stroke={Colors.neutrals.gray300}
              strokeWidth="1"
            />
            <Line
              x1="32"
              y1={chartHeight * 0.25 + 40}
              x2={width - 32}
              y2={chartHeight * 0.25 + 40}
              stroke={Colors.neutrals.gray200}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <Line
              x1="32"
              y1={chartHeight * 0.5 + 40}
              x2={width - 32}
              y2={chartHeight * 0.5 + 40}
              stroke={Colors.neutrals.gray200}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <Line
              x1="32"
              y1={chartHeight * 0.75 + 40}
              x2={width - 32}
              y2={chartHeight * 0.75 + 40}
              stroke={Colors.neutrals.gray200}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <Line
              x1="32"
              y1={chartHeight + 40}
              x2={width - 32}
              y2={chartHeight + 40}
              stroke={Colors.neutrals.gray300}
              strokeWidth="1"
            />
            
            {/* Y-axis labels */}
            <SvgText
              x="20"
              y={chartHeight + 45}
              textAnchor="end"
              fill={Colors.neutrals.gray600}
              fontSize="10"
            >
              0
            </SvgText>
            <SvgText
              x="20"
              y={chartHeight * 0.75 + 45}
              textAnchor="end"
              fill={Colors.neutrals.gray600}
              fontSize="10"
            >
              {Math.round(maxTasks * 0.25)}
            </SvgText>
            <SvgText
              x="20"
              y={chartHeight * 0.5 + 45}
              textAnchor="end"
              fill={Colors.neutrals.gray600}
              fontSize="10"
            >
              {Math.round(maxTasks * 0.5)}
            </SvgText>
            <SvgText
              x="20"
              y={chartHeight * 0.25 + 45}
              textAnchor="end"
              fill={Colors.neutrals.gray600}
              fontSize="10"
            >
              {Math.round(maxTasks * 0.75)}
            </SvgText>
            <SvgText
              x="20"
              y="45"
              textAnchor="end"
              fill={Colors.neutrals.gray600}
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
                fill={Colors.neutrals.gray600}
                fontSize="10"
              >
                {d.date}
              </SvgText>
            ))}
            
            {/* Gradient definition for the area under the line */}
            <Defs>
              <SvgLinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={Colors.primary.blue} stopOpacity="0.3" />
                <Stop offset="1" stopColor={Colors.primary.blue} stopOpacity="0.05" />
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
                stroke={Colors.primary.blue}
                strokeWidth="3"
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
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
                    fill={Colors.neutrals.white}
                    stroke={Colors.primary.blue}
                    strokeWidth="2"
                  />
                </Animated.View>
              )
            })}
          </AnimatedSvg>
        </View>
      </View>
    )
  }
  
  // Render bar chart for project progress
  const renderProjectsChart = () => {
    const barChartHeight = 200
    const barWidth = (width - 64) / projectsData.length - 12
    
    // Animated bars
    const animatedBars = projectsData.map((project, i) => {
      return useAnimatedStyle(() => {
        const progress = barChartProgress.value
        const delay = i * 100
        
        return {
          height: barChartHeight * project.progress * progress,
          opacity: withTiming(1, { duration: 300 + delay })
        }
      })
    })
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Project Progress</Text>
        
        <View style={styles.barChartContainer}>
          {projectsData.map((project, i) => (
            <View key={project.id} style={styles.barColumn}>
              <Animated.View 
                style={[
                  styles.bar,
                  { width: barWidth },
                  getBarColor(project.progress),
                  animatedBars[i]
                ]}
              />
              <Text style={styles.barLabel} numberOfLines={1}>
                {project.name}
              </Text>
              <Text style={styles.barValue}>{Math.round(project.progress * 100)}%</Text>
            </View>
          ))}
        </View>
      </View>
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
          opacity: withTiming(progress, { duration: 300 + delay }),
          transform: [
            { scale: withTiming(progress, { duration: 300 + delay }) }
          ]
        }
      })
    })
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Team Performance</Text>
        
        <View style={styles.radarChartContainer}>
          <Svg height={radius * 2 + 80} width={width}>
            {/* Background circles */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke={Colors.neutrals.gray200}
              strokeWidth="1"
            />
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.75}
              fill="none"
              stroke={Colors.neutrals.gray200}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.5}
              fill="none"
              stroke={Colors.neutrals.gray200}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.25}
              fill="none"
              stroke={Colors.neutrals.gray200}
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
                stroke={Colors.neutrals.gray300}
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
                fill="rgba(61, 90, 254, 0.15)"
                stroke={Colors.primary.blue}
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
                    fill={Colors.neutrals.white}
                    stroke={point.color}
                    strokeWidth="2"
                  />
                  <SvgText
                    x="6"
                    y="20"
                    textAnchor="middle"
                    fill={Colors.neutrals.gray700}
                    fontSize="9"
                  >
                    {point.tasksCompleted}
                  </SvgText>
                </G>
              </Animated.View>
            ))}
          </Svg>
        </View>
      </View>
    )
  }
  
  // Helper function to get color based on progress
  const getBarColor = (progress: number) => {
    if (progress < 0.3) {
      return { backgroundColor: Colors.status.error }
    } else if (progress < 0.7) {
      return { backgroundColor: Colors.status.warning }
    } else {
      return { backgroundColor: Colors.status.success }
    }
  }
  
  // Helper function to get color for team
  const getTeamColor = (index: number) => {
    const colors = [
      Colors.primary.blue,
      Colors.secondary.green,
      Colors.primary.purple,
      Colors.primary.yellow,
      Colors.primary.red
    ]
    
    return colors[index % colors.length]
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        
        {/* Date range selector */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRangeContainer}
        >
          {DATE_RANGES.map(range => (
            <TouchableOpacity
              key={range.id}
              style={[
                styles.dateRangeButton,
                dateRange === range.id && styles.activeDateRange
              ]}
              onPress={() => handleDateRangeChange(range.id)}
            >
              <Text 
                style={[
                  styles.dateRangeText,
                  dateRange === range.id && styles.activeDateRangeText
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Scrollable content */}
      <Animated.ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Overview Metrics */}
        <View style={styles.overviewContainer}>
          {isLoading ? (
            // Loading state
            <View style={styles.overviewGrid}>
              {[1, 2, 3, 4].map(i => (
                <View key={i} style={styles.metricCardSkeleton}>
                  <View style={styles.metricIconSkeleton} />
                  <View style={styles.metricLabelSkeleton} />
                  <View style={styles.metricValueSkeleton} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.overviewGrid}>
              {overviewMetrics.map((metric, index) => (
                <Animated.View 
                  key={metric.label}
                  entering={FadeIn.delay(index * 100).duration(500)}
                >
                  <TouchableOpacity style={styles.metricCard} activeOpacity={0.8}>
                    <View 
                      style={[
                        styles.metricIconContainer, 
                        { backgroundColor: metric.color + '20' }
                      ]}
                    >
                      <Feather name={metric.icon} size={20} color={metric.color} />
                    </View>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={styles.metricValue}>{formatNumber(metric.value)}</Text>
                    <View style={styles.metricChangeContainer}>
                      <Feather 
                        name={metric.change >= 0 ? 'arrow-up' : 'arrow-down'} 
                        size={12} 
                        color={metric.change >= 0 ? Colors.status.success : Colors.status.error} 
                      />
                      <Text
                        style={[
                          styles.metricChangeText,
                          { 
                            color: metric.change >= 0 ? 
                              Colors.status.success : 
                              Colors.status.error 
                          }
                        ]}
                      >
                        {Math.abs(metric.change)}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
        
        {/* Charts */}
        {isLoading ? (
          <View style={styles.chartsSkeleton}>
            <View style={styles.chartSkeleton}>
              <View style={styles.chartTitleSkeleton} />
              <View style={styles.chartContentSkeleton} />
            </View>
            <View style={styles.chartSkeleton}>
              <View style={styles.chartTitleSkeleton} />
              <View style={styles.chartContentSkeleton} />
            </View>
          </View>
        ) : (
          <View style={styles.chartsContainer}>
            {renderLineChart()}
            {renderProjectsChart()}
            {renderTeamPerformanceChart()}
          </View>
        )}
        
        {/* Export options */}
        <View style={styles.exportContainer}>
          <Text style={styles.exportTitle}>Export Analytics</Text>
          <View style={styles.exportOptions}>
            <TouchableOpacity style={styles.exportButton}>
              <Feather name="file-text" size={20} color={Colors.primary.blue} />
              <Text style={styles.exportButtonText}>PDF Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton}>
              <Feather name="file" size={20} color={Colors.primary.blue} />
              <Text style={styles.exportButtonText}>CSV Data</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    padding: 20,
    backgroundColor: Colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginBottom: 16
  },
  dateRangeContainer: {
    paddingRight: 20
  },
  dateRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutrals.gray100,
    marginRight: 8
  },
  activeDateRange: {
    backgroundColor: Colors.primary.blue
  },
  dateRangeText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray700
  },
  activeDateRangeText: {
    color: Colors.neutrals.white
  },
  scrollContainer: {
    flex: 1
  },
  scrollContent: {
    padding: 20
  },
  overviewContainer: {
    marginBottom: 20
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6
  },
  metricCard: {
    backgroundColor: Colors.neutrals.white,
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    marginHorizontal: 6,
    marginBottom: 12,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  metricLabel: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginBottom: 8
  },
  metricValue: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginBottom: 8
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
    marginBottom: 24
  },
  chartSkeleton: {
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
  chartTitleSkeleton: {
    width: '40%',
    height: 24,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 4,
    marginBottom: 16
  },
  chartContentSkeleton: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 8
  },
  metricCardSkeleton: {
    backgroundColor: Colors.neutrals.white,
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    marginHorizontal: 6,
    marginBottom: 12
  },
  metricIconSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutrals.gray200,
    marginBottom: 12
  },
  metricLabelSkeleton: {
    width: '70%',
    height: 14,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 4,
    marginBottom: 8
  },
  metricValueSkeleton: {
    width: '50%',
    height: 24,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 4,
    marginBottom: 8
  },
  chartsContainer: {
    marginBottom: 24
  },
  chartContainer: {
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  chartTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 16
  },
  chartLegend: {
    flexDirection: 'row'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4
  },
  legendText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
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
    width: '20%'
  },
  bar: {
    borderRadius: 4,
    width: 20,
    maxWidth: 30
  },
  barLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray700,
    marginTop: 8,
    textAlign: 'center',
    width: '100%'
  },
  barValue: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginTop: 4
  },
  radarChartContainer: {
    height: 280,
    alignItems: 'center'
  },
  exportContainer: {
    backgroundColor: Colors.neutrals.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  exportTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 16
  },
  exportOptions: {
    flexDirection: 'row'
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.blue + '10',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12
  },
  exportButtonText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.primary.blue,
    marginLeft: 8
  }
})

export default AnalyticsScreen