import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from '../UI/Text';
import { Checkbox } from '../UI/Checkbox';
import { Badge } from '../UI/Badge';
import { Avatar } from '../UI/Avatar';
import { DateUtils } from '../../Utils/DateUtils';
import { TaskService } from '../../Services/TaskService';
import Icon from 'react-native-vector-icons/Ionicons';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    priority: 'High' | 'Medium' | 'Low';
    deadline?: string;
    projectId: string;
    projectName?: string;
    assignee?: {
      id: string;
      name: string;
      avatar?: string;
    };
    hasAttachments?: boolean;
    commentCount?: number;
    subtaskCount?: number;
    completedSubtasks?: number;
  };
  variant?: 'default' | 'compact' | 'minimal';
  onStatusChange?: (taskId: string, status: string) => void;
}

export const TaskCard = ({ 
  task, 
  variant = 'default', 
  onStatusChange 
}: TaskCardProps) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const scale = useSharedValue(1);
  const swipeableRef = React.useRef<Swipeable>(null);

  const handlePress = () => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleStatusToggle = async () => {
    try {
      const newStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
      await TaskService.updateTaskStatus(task.id, newStatus);
      
      if (onStatusChange) {
        onStatusChange(task.id, newStatus);
      }
      
      if (swipeableRef.current) {
        swipeableRef.current.close();
      }
    } catch (error) {
      console.log('Failed to update task status', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return theme.colors.error;
      case 'Medium':
        return theme.colors.warning;
      case 'Low':
        return theme.colors.success;
      default:
        return theme.colors.info;
    }
  };

  const isDeadlineClose = () => {
    if (!task.deadline) return false;
    
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  };

  const isDeadlinePassed = () => {
    if (!task.deadline) return false;
    
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  const renderRightActions = () => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.success },
          ]}
          onPress={handleStatusToggle}
        >
          <Icon
            name={task.status === 'Completed' ? 'refresh-outline' : 'checkmark-outline'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.info },
          ]}
          onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
        >
          <Icon name="create-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  if (variant === 'compact') {
    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        friction={2}
        rightThreshold={40}
      >
        <AnimatedTouchable
          style={[
            styles.compactContainer,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              ...theme.shadows.small,
            },
            animatedStyle,
          ]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Checkbox
            checked={task.status === 'Completed'}
            onToggle={handleStatusToggle}
            style={styles.checkbox}
          />
          
          <View style={styles.compactContent}>
            <View style={styles.compactHeader}>
              <Text
                variant="subtitle"
                numberOfLines={1}
                style={[
                  styles.compactTitle,
                  task.status === 'Completed' && {
                    textDecorationLine: 'line-through',
                    color: theme.colors.textSecondary,
                  },
                ]}
              >
                {task.title}
              </Text>
              
              <Badge
                label={task.priority}
                color={getPriorityColor(task.priority)}
                size="small"
              />
            </View>
            
            {task.projectName && (
              <View style={styles.projectContainer}>
                <Icon name="folder-outline" size={12} color={theme.colors.textSecondary} />
                <Text
                  variant="caption"
                  numberOfLines={1}
                  style={{ marginLeft: 4, color: theme.colors.textSecondary }}
                >
                  {task.projectName}
                </Text>
              </View>
            )}
            
            <View style={styles.compactFooter}>
              {task.deadline && (
                <View style={styles.iconInfoContainer}>
                  <Icon name="calendar-outline" size={12} color={theme.colors.textSecondary} />
                  <Text
                    variant="caption"
                    style={{
                      marginLeft: 4,
                      color: isDeadlinePassed()
                        ? theme.colors.error
                        : isDeadlineClose()
                        ? theme.colors.warning
                        : theme.colors.textSecondary,
                    }}
                  >
                    {DateUtils.formatDate(task.deadline)}
                  </Text>
                </View>
              )}
              
              {task.assignee && (
                <Avatar
                  name={task.assignee.name}
                  uri={task.assignee.avatar}
                  size={20}
                />
              )}
            </View>
          </View>
        </AnimatedTouchable>
      </Swipeable>
    );
  }

  if (variant === 'minimal') {
    return (
      <AnimatedTouchable
        style={[
          styles.minimalContainer,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            ...theme.shadows.small,
          },
          animatedStyle,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Checkbox
          checked={task.status === 'Completed'}
          onToggle={handleStatusToggle}
          style={styles.checkbox}
        />
        
        <View style={styles.minimalContent}>
          <Text
            variant="body2"
            numberOfLines={1}
            style={[
              task.status === 'Completed' && {
                textDecorationLine: 'line-through',
                color: theme.colors.textSecondary,
              },
            ]}
          >
            {task.title}
          </Text>
        </View>
        
        <Badge
          label={task.priority[0]}
          color={getPriorityColor(task.priority)}
          size="small"
        />
      </AnimatedTouchable>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
    >
      <AnimatedTouchable
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            ...theme.shadows.small,
          },
          animatedStyle,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          <View style={styles.checkboxContainer}>
            <Checkbox checked={task.status === 'Completed'} onToggle={handleStatusToggle} />
          </View>
          
          <View style={styles.titleContainer}>
            <Text
              variant="h3"
              numberOfLines={1}
              style={[
                task.status === 'Completed' && {
                  textDecorationLine: 'line-through',
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              {task.title}
            </Text>
            
            {task.projectName && (
              <View style={styles.projectContainer}>
                <Icon name="folder-outline" size={14} color={theme.colors.textSecondary} />
                <Text
                  variant="caption"
                  numberOfLines={1}
                  style={{ marginLeft: 4, color: theme.colors.textSecondary }}
                >
                  {task.projectName}
                </Text>
              </View>
            )}
          </View>
          
          <Badge
            label={task.priority}
            color={getPriorityColor(task.priority)}
          />
        </View>

        {task.description && (
          <Text
            variant="body2"
            numberOfLines={2}
            style={[
              styles.description,
              { color: theme.colors.textSecondary },
              task.status === 'Completed' && { color: theme.colors.textSecondary + '80' },
            ]}
          >
            {task.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {task.deadline && (
              <View style={styles.iconInfoContainer}>
                <Icon name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                <Text
                  variant="caption"
                  style={{
                    marginLeft: 6,
                    color: isDeadlinePassed()
                      ? theme.colors.error
                      : isDeadlineClose()
                      ? theme.colors.warning
                      : theme.colors.textSecondary,
                  }}
                >
                  {isDeadlinePassed() ? 'Overdue' : DateUtils.formatDate(task.deadline)}
                </Text>
              </View>
            )}
            
            {task.subtaskCount > 0 && (
              <View style={[styles.iconInfoContainer, { marginLeft: 12 }]}>
                <Icon name="list-outline" size={16} color={theme.colors.textSecondary} />
                <Text variant="caption" style={{ marginLeft: 6, color: theme.colors.textSecondary }}>
                  {task.completedSubtasks}/{task.subtaskCount}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footerRight}>
            {task.hasAttachments && (
              <Icon name="attach-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
            )}
            
            {task.commentCount > 0 && (
              <View style={styles.iconInfoContainer}>
                <Icon name="chatbubble-outline" size={16} color={theme.colors.textSecondary} />
                <Text variant="caption" style={{ marginLeft: 4, color: theme.colors.textSecondary }}>
                  {task.commentCount}
                </Text>
              </View>
            )}
            
            {task.assignee && (
              <Avatar
                name={task.assignee.name}
                uri={task.assignee.avatar}
                size={28}
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
        </View>
      </AnimatedTouchable>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 2,
    marginVertical: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  description: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  compactContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 2,
    marginVertical: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  compactContent: {
    flex: 1,
    marginLeft: 8,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  compactTitle: {
    flex: 1,
    marginRight: 8,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
    borderWidth: 1,
  },
  minimalContent: {
    flex: 1,
    marginHorizontal: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  rightActions: {
    flexDirection: 'row',
    height: '100%',
  },
  actionButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});