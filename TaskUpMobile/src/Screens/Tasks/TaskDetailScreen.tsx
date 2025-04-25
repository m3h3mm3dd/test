import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from '../../Components/UI/Text';
import { Card } from '../../Components/UI/Card';
import { Badge } from '../../Components/UI/Badge';
import { Checkbox } from '../../Components/UI/Checkbox';
import { Button } from '../../Components/UI/Button';
import { IconButton } from '../../Components/UI/IconButton';
import { Avatar } from '../../Components/UI/Avatar';
import { TaskService } from '../../Services/TaskService';
import { DateUtils } from '../../Utils/DateUtils';
import Icon from 'react-native-vector-icons/Ionicons';

export const TaskDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  
  const { taskId } = route.params;

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch the task details from API
      // For now, let's use mock data
      setTimeout(() => {
        const mockTask = {
          id: taskId,
          title: 'Design home screen',
          description: 'Create a new home screen design with improved UX and visual hierarchy. Focus on minimalist approach with clear CTAs.',
          status: 'In Progress',
          priority: 'High',
          deadline: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
          projectId: '1',
          projectName: 'Mobile App Redesign',
          assignee: {
            id: '1',
            name: 'John Doe',
          },
          createdAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
          updatedAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        };
        
        const mockSubtasks = [
          { id: '1', title: 'Research competitor apps', completed: true },
          { id: '2', title: 'Create wireframes', completed: true },
          { id: '3', title: 'Design high-fidelity mockups', completed: false },
          { id: '4', title: 'Review with team', completed: false },
        ];
        
        const mockComments = [
          { 
            id: '1', 
            text: 'I think we should focus on simplifying the navigation.',
            createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
            user: {
              id: '2',
              name: 'Jane Smith',
              avatar: null,
            }
          },
          { 
            id: '2', 
            text: 'Good point. Let\'s also consider accessibility improvements.',
            createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
            user: {
              id: '1',
              name: 'John Doe',
              avatar: null,
            }
          },
        ];
        
        setTask(mockTask);
        setSubtasks(mockSubtasks);
        setComments(mockComments);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load task details', error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await TaskService.updateTaskStatus(taskId, newStatus);
      setTask({ ...task, status: newStatus });
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      text: newComment,
      createdAt: new Date().toISOString(),
      user: {
        id: '1', // Current user ID
        name: 'John Doe', // Current user name
        avatar: null,
      }
    };
    
    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleSubtaskToggle = (subtaskId) => {
    setSubtasks(
      subtasks.map(subtask =>
        subtask.id === subtaskId
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      )
    );
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    
    const subtask = {
      id: Date.now().toString(),
      title: newSubtask,
      completed: false,
    };
    
    setSubtasks([...subtasks, subtask]);
    setNewSubtask('');
    setIsAddingSubtask(false);
  };

  const getPriorityColor = (priority) => {
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

  if (loading || !task) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Icon name="hourglass-outline" size={48} color={theme.colors.primary} />
        <Text variant="h3" style={{ marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="h1" style={styles.title}>
              {task.title}
            </Text>
            <View style={styles.tagsContainer}>
              <Badge
                label={task.status}
                color={
                  task.status === 'Completed'
                    ? theme.colors.success
                    : task.status === 'In Progress'
                    ? theme.colors.info
                    : theme.colors.warning
                }
                style={styles.badge}
              />
              <Badge
                label={task.priority}
                color={getPriorityColor(task.priority)}
                style={styles.badge}
              />
            </View>
          </View>
          
          <View style={styles.projectContainer}>
            <Icon name="folder-outline" size={16} color={theme.colors.textSecondary} />
            <Text
              variant="subtitle"
              style={{ marginLeft: 6, color: theme.colors.textSecondary }}
            >
              {task.projectName}
            </Text>
          </View>
          
          {task.description && (
            <Text
              variant="body"
              style={[styles.description, { color: theme.colors.text }]}
            >
              {task.description}
            </Text>
          )}
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Icon name="calendar-outline" size={18} color={theme.colors.textSecondary} />
              <Text
                variant="body"
                style={[
                  styles.detailText,
                  {
                    color: DateUtils.isOverdue(task.deadline)
                      ? theme.colors.error
                      : theme.colors.text
                  }
                ]}
              >
                {DateUtils.formatDate(task.deadline, 'long')}
                {DateUtils.isOverdue(task.deadline) && ' (Overdue)'}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="person-outline" size={18} color={theme.colors.textSecondary} />
              <View style={styles.assigneeContainer}>
                <Text
                  variant="body"
                  style={[styles.detailText, { color: theme.colors.text }]}
                >
                  Assigned to:
                </Text>
                <Avatar
                  name={task.assignee.name}
                  size={24}
                  style={{ marginLeft: 8 }}
                />
                <Text
                  variant="body"
                  style={[
                    styles.detailText,
                    { color: theme.colors.text, marginLeft: 6 }
                  ]}
                >
                  {task.assignee.name}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="time-outline" size={18} color={theme.colors.textSecondary} />
              <Text
                variant="body"
                style={[styles.detailText, { color: theme.colors.text }]}
              >
                Created {DateUtils.getRelativeTimeString(new Date(task.createdAt))}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h2">Subtasks</Text>
            <Text variant="body" style={{ color: theme.colors.primary }}>
              {subtasks.filter(s => s.completed).length}/{subtasks.length} completed
            </Text>
          </View>
          
          <Card style={styles.subtasksCard}>
            {subtasks.map((subtask) => (
              <View key={subtask.id} style={styles.subtaskItem}>
                <Checkbox
                  checked={subtask.completed}
                  onToggle={() => handleSubtaskToggle(subtask.id)}
                />
                <Text
                  variant="body"
                  style={[
                    styles.subtaskText,
                    {
                      color: subtask.completed
                        ? theme.colors.textSecondary
                        : theme.colors.text,
                      textDecorationLine: subtask.completed
                        ? 'line-through'
                        : 'none',
                    },
                  ]}
                >
                  {subtask.title}
                </Text>
              </View>
            ))}
            
            {isAddingSubtask ? (
              <View style={styles.addSubtaskContainer}>
                <TextInput
                  style={[
                    styles.subtaskInput,
                    { 
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder="New subtask..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={newSubtask}
                  onChangeText={setNewSubtask}
                  autoFocus
                />
                <View style={styles.subtaskButtons}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    size="small"
                    onPress={() => {
                      setIsAddingSubtask(false);
                      setNewSubtask('');
                    }}
                    style={{ marginRight: 8 }}
                  />
                  <Button
                    title="Add"
                    size="small"
                    onPress={handleAddSubtask}
                  />
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addSubtaskButton}
                onPress={() => setIsAddingSubtask(true)}
              >
                <Icon name="add" size={20} color={theme.colors.primary} />
                <Text
                  variant="button"
                  style={{ color: theme.colors.primary, marginLeft: 4 }}
                >
                  Add Subtask
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionHeader}>
            Comments
          </Text>
          
          <Card style={styles.commentsCard}>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Avatar
                  name={comment.user.name}
                  uri={comment.user.avatar}
                  size={32}
                />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text variant="subtitle">{comment.user.name}</Text>
                    <Text
                      variant="caption"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {DateUtils.getRelativeTimeString(new Date(comment.createdAt))}
                    </Text>
                  </View>
                  <Text variant="body">{comment.text}</Text>
                </View>
              </View>
            ))}
            
            <View style={styles.addCommentContainer}>
              <Avatar
                name="John Doe" // Current user
                size={32}
              />
              <TextInput
                style={[
                  styles.commentInput,
                  { 
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Add a comment..."
                placeholderTextColor={theme.colors.textSecondary}
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <IconButton
                name="send"
                onPress={handleAddComment}
                color={theme.colors.primary}
                disabled={!newComment.trim()}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
      
      <View 
        style={[
          styles.actionBar,
          { 
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          }
        ]}
      >
        <View style={styles.statusButtons}>
          <Button
            title="Not Started"
            variant={task.status === 'Not Started' ? 'primary' : 'outline'}
            size="small"
            onPress={() => handleStatusChange('Not Started')}
            style={styles.statusButton}
          />
          <Button
            title="In Progress"
            variant={task.status === 'In Progress' ? 'primary' : 'outline'}
            size="small"
            onPress={() => handleStatusChange('In Progress')}
            style={styles.statusButton}
          />
          <Button
            title="Completed"
            variant={task.status === 'Completed' ? 'primary' : 'outline'}
            size="small"
            onPress={() => handleStatusChange('Completed')}
            style={styles.statusButton}
          />
        </View>
        
        <IconButton
          name="create-outline"
          onPress={() => navigation.navigate('EditTask', { taskId })}
          style={[
            styles.editButton,
            { backgroundColor: theme.colors.primary + '20' },
          ]}
          color={theme.colors.primary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  titleContainer: {
    marginBottom: 8,
  },
  title: {
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    marginRight: 8,
    marginBottom: 8,
  },
  projectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  description: {
    marginBottom: 16,
    lineHeight: 24,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
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
  subtasksCard: {
    padding: 16,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  subtaskText: {
    marginLeft: 8,
    flex: 1,
  },
  addSubtaskContainer: {
    marginTop: 8,
  },
  subtaskInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  subtaskButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addSubtaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  commentsCard: {
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 12,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  statusButtons: {
    flexDirection: 'row',
  },
  statusButton: {
    marginRight: 8,
  },
  editButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});