import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, StatusBar, FlatList, TouchableOpacity } from 'react-native'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import ListItem from '../components/ListItem/ListItem'
import PrimaryButton from '../components/Button/PrimaryButton'
import SkeletonLoader from '../components/Skeleton/SkeletonLoader'

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setTasks([
        { id: '1', title: 'Complete mobile design', status: 'in-progress', dueDate: '2025-05-10' },
        { id: '2', title: 'Review project proposal', status: 'pending', dueDate: '2025-05-12' },
        { id: '3', title: 'Team meeting', status: 'completed', dueDate: '2025-05-08' }
      ])
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleTaskPress = (taskId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    navigation.navigate('TaskScreen', { taskId })
  }

  const handleAddTask = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    navigation.navigate('TaskScreen', { isNew: true })
  }

  const renderTaskItem = ({ item }) => (
    <Animated.View entering={FadeInUp.delay(parseInt(item.id) * 100)}>
      <ListItem
        title={item.title}
        subtitle={`Due: ${item.dueDate}`}
        onPress={() => handleTaskPress(item.id)}
        rightIcon={<StatusDot status={item.status} />}
      />
    </Animated.View>
  )

  const renderSkeletons = () => (
    <>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonContainer}>
          <SkeletonLoader width={'70%'} height={24} borderRadius={4} />
          <SkeletonLoader width={'40%'} height={16} borderRadius={4} style={styles.skeletonSubtitle} />
        </View>
      ))}
    </>
  )

  return (
    <AnimatedSafeAreaView style={styles.container} entering={FadeInUp}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
      
      <Animated.View style={styles.header} entering={FadeInDown}>
        <Text style={styles.title}>TaskUp</Text>
        <Text style={styles.subtitle}>Your daily tasks</Text>
      </Animated.View>

      <View style={styles.content}>
        {loading ? (
          renderSkeletons()
        ) : (
          <FlatList
            data={tasks}
            renderItem={renderTaskItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Animated.View style={styles.footer} entering={FadeInUp.delay(300)}>
        <PrimaryButton
          title="Add New Task"
          onPress={handleAddTask}
          fullWidth
        />
      </Animated.View>
    </AnimatedSafeAreaView>
  )
}

// Helper component for task status
const StatusDot = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case 'completed':
        return Colors.success
      case 'in-progress':
        return Colors.primary.blue
      case 'pending':
        return Colors.warning
      default:
        return Colors.neutrals.gray400
    }
  }

  return (
    <View style={[styles.statusDot, { backgroundColor: getColor() }]} />
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
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  skeletonContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.neutrals.white,
    borderRadius: 8,
    marginBottom: Spacing.md
  },
  skeletonSubtitle: {
    marginTop: Spacing.sm
  }
})

export default HomeScreen