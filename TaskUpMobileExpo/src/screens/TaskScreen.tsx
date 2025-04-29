import React, { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  TouchableOpacity
} from 'react-native'
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import TextInputField from '../components/Input/TextInputField'
import PrimaryButton from '../components/Button/PrimaryButton'
import SecondaryButton from '../components/Button/SecondaryButton'
import Checkbox from '../components/Checkbox/Checkbox'

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)

const TaskScreen = ({ navigation, route }) => {
  const { taskId, isNew } = route.params || {}
  
  const [task, setTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    isCompleted: false
  })

  useEffect(() => {
    if (taskId && !isNew) {
      // Simulate fetching task data
      setTask({
        title: 'Complete mobile design',
        description: 'Finish the design for the mobile application including all screens and components',
        dueDate: '2025-05-10',
        isCompleted: false
      })
    }
  }, [taskId, isNew])

  const handleChange = (field, value) => {
    setTask(prev => ({ ...prev, [field]: value }))
  }

  const handleToggleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setTask(prev => ({ ...prev, isCompleted: !prev.isCompleted }))
  }

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    // Save task logic would go here
    navigation.goBack()
  }

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }

  return (
    <AnimatedSafeAreaView style={styles.container} entering={FadeIn}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
      
      <Animated.View style={styles.header} entering={SlideInRight.delay(100)}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isNew ? 'New Task' : 'Edit Task'}</Text>
      </Animated.View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={SlideInRight.delay(200)}>
          <TextInputField
            label="Task Title"
            placeholder="Enter task title"
            value={task.title}
            onChangeText={(text) => handleChange('title', text)}
          />
        </Animated.View>

        <Animated.View entering={SlideInRight.delay(300)}>
          <TextInputField
            label="Description"
            placeholder="Enter task description"
            value={task.description}
            onChangeText={(text) => handleChange('description', text)}
          />
        </Animated.View>

        <Animated.View entering={SlideInRight.delay(400)}>
          <TextInputField
            label="Due Date"
            placeholder="YYYY-MM-DD"
            value={task.dueDate}
            onChangeText={(text) => handleChange('dueDate', text)}
          />
        </Animated.View>

        {!isNew && (
          <Animated.View style={styles.completedContainer} entering={SlideInRight.delay(500)}>
            <Text style={styles.completedLabel}>Mark as completed</Text>
            <Checkbox checked={task.isCompleted} onToggle={handleToggleComplete} />
          </Animated.View>
        )}
      </ScrollView>

      <Animated.View style={styles.footer} entering={SlideInRight.delay(600)}>
        <View style={styles.buttonContainer}>
          <SecondaryButton
            title="Cancel"
            onPress={handleCancel}
            style={styles.cancelButton}
          />
          <PrimaryButton
            title="Save"
            onPress={handleSave}
          />
        </View>
      </Animated.View>
    </AnimatedSafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    marginRight: Spacing.md
  },
  backButtonText: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium
  },
  title: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: Spacing.lg
  },
  completedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.neutrals.gray100,
    borderRadius: 8
  },
  completedLabel: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray800
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutrals.gray200
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    marginRight: Spacing.md
  }
})

export default TaskScreen