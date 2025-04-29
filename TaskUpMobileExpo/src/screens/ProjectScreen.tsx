import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, StatusBar, FlatList } from 'react-native'
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import ListItem from '../components/ListItem/ListItem'
import PrimaryButton from '../components/Button/PrimaryButton'
import SkeletonLoader from '../components/Skeleton/SkeletonLoader'

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)

const ProjectScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setProjects([
        { id: '1', title: 'Mobile App Redesign', tasksCount: 8, progress: 0.4 },
        { id: '2', title: 'Website Development', tasksCount: 12, progress: 0.7 },
        { id: '3', title: 'Marketing Campaign', tasksCount: 5, progress: 0.2 }
      ])
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const renderProjectItem = ({ item }) => (
    <Animated.View entering={SlideInLeft.delay(parseInt(item.id) * 100)}>
      <ListItem
        title={item.title}
        subtitle={`${item.tasksCount} tasks`}
        rightIcon={<ProgressIndicator progress={item.progress} />}
      />
    </Animated.View>
  )

  const renderSkeletons = () => (
    <>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonContainer}>
          <SkeletonLoader width={'60%'} height={24} borderRadius={4} />
          <SkeletonLoader width={'30%'} height={16} borderRadius={4} style={styles.skeletonSubtitle} />
          <SkeletonLoader width={'100%'} height={8} borderRadius={4} style={styles.skeletonProgress} />
        </View>
      ))}
    </>
  )

  return (
    <AnimatedSafeAreaView style={styles.container} entering={FadeIn}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
      
      <Animated.View style={styles.header} entering={SlideInLeft.delay(100)}>
        <Text style={styles.title}>Projects</Text>
        <Text style={styles.subtitle}>Manage your projects</Text>
      </Animated.View>

      <View style={styles.content}>
        {loading ? (
          renderSkeletons()
        ) : (
          <FlatList
            data={projects}
            renderItem={renderProjectItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Animated.View style={styles.footer} entering={SlideInLeft.delay(300)}>
        <PrimaryButton
          title="New Project"
          onPress={() => {}}
          fullWidth
        />
      </Animated.View>
    </AnimatedSafeAreaView>
  )
}

// Helper component for progress
const ProgressIndicator = ({ progress }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <View 
          style={[
            styles.progressFill,
            { width: `${progress * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>{`${Math.round(progress * 100)}%`}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray600,
    marginTop: Spacing.xs
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg
  },
  listContent: {
    paddingBottom: Spacing.lg
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutrals.gray200
  },
  progressContainer: {
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
  skeletonContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.neutrals.white,
    borderRadius: 8,
    marginBottom: Spacing.md
  },
  skeletonSubtitle: {
    marginTop: Spacing.sm
  },
  skeletonProgress: {
    marginTop: Spacing.md,
    alignSelf: 'flex-end'
  }
})

export default ProjectScreen