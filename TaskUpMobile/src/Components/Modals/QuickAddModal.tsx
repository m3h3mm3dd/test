import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from '../UI/Text';
import { InputField } from '../Forms/InputField';
import { Button } from '../UI/Button';
import { Dropdown } from '../Forms/Dropdown';
import { BlurView } from '@react-native-community/blur';
import { ProjectService } from '../../Services/ProjectService';
import { TaskService } from '../../Services/TaskService';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';

interface QuickAddModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type ItemType = 'task' | 'project' | 'team';

export const QuickAddModal = ({ isVisible, onClose }: QuickAddModalProps) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [itemType, setItemType] = useState<ItemType>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const progress = useSharedValue(0);
  const translateY = useSharedValue(300);

  useEffect(() => {
    if (isVisible) {
      progress.value = withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      });
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      });
    } else {
      progress.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      });
      translateY.value = withTiming(300, {
        duration: 300,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      });
    }
  }, [isVisible, progress, translateY]);

  useEffect(() => {
    if (isVisible && itemType === 'task') {
      loadProjects();
    }
  }, [isVisible, itemType]);

  const loadProjects = async () => {
    try {
      const projectsData = await ProjectService.getProjects();
      setProjects(
        projectsData.map((p: any) => ({
          label: p.name,
          value: p.id,
        }))
      );
      
      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }
    } catch (error) {
      console.log('Failed to load projects', error);
    }
  };

  const handleCreate = async () => {
    if (!title) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: `Please enter a title for the ${itemType}`,
      });
      return;
    }

    setIsLoading(true);
    try {
      if (itemType === 'task') {
        if (!selectedProject) {
          Toast.show({
            type: 'error',
            text1: 'Missing Information',
            text2: 'Please select a project for this task',
          });
          setIsLoading(false);
          return;
        }

        await TaskService.createTask({
          title,
          description,
          projectId: selectedProject,
          status: 'Not Started',
          priority: 'Medium',
        });

        Toast.show({
          type: 'success',
          text1: 'Task Created',
          text2: 'Your new task has been created successfully',
        });
      } else if (itemType === 'project') {
        await ProjectService.createProject({
          name: title,
          description,
          startDate: new Date().toISOString(),
          status: 'Not Started',
        });

        Toast.show({
          type: 'success',
          text1: 'Project Created',
          text2: 'Your new project has been created successfully',
        });
      } else if (itemType === 'team') {
        await ProjectService.createTeam({
          name: title,
          description,
        });

        Toast.show({
          type: 'success',
          text1: 'Team Created',
          text2: 'Your new team has been created successfully',
        });
      }

      handleClose();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Creation Failed',
        text2: `Failed to create ${itemType}. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvancedCreate = () => {
    handleClose();
    
    setTimeout(() => {
      if (itemType === 'task') {
        navigation.navigate('CreateTask', { projectId: selectedProject });
      } else if (itemType === 'project') {
        navigation.navigate('CreateProject');
      } else if (itemType === 'team') {
        navigation.navigate('CreateTeam');
      }
    }, 300);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    translateY.value = withTiming(
      300,
      {
        duration: 300,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      },
      () => {
        runOnJS(resetAndClose)();
      }
    );
  };

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setSelectedProject(projects.length > 0 ? projects[0].value : null);
    onClose();
  };

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: translateY.value,
        },
      ],
    };
  });

  const renderTypeButton = (type: ItemType, label: string, iconName: string) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        {
          backgroundColor:
            itemType === type ? theme.colors.primary : 'transparent',
          borderColor:
            itemType === type ? theme.colors.primary : theme.colors.border,
        },
      ]}
      onPress={() => setItemType(type)}
      activeOpacity={0.8}
    >
      <Icon
        name={iconName}
        size={20}
        color={itemType === type ? 'white' : theme.colors.textSecondary}
      />
      <Text
        variant="button"
        style={{
          color: itemType === type ? 'white' : theme.colors.text,
          marginLeft: 8,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} animationType="none">
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <BlurView
            style={StyleSheet.absoluteFillObject}
            blurType={theme.isDarkMode ? 'dark' : 'light'}
            blurAmount={8}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.container,
                  {
                    backgroundColor: theme.isDarkMode
                      ? 'rgba(30, 30, 30, 0.95)'
                      : 'rgba(255, 255, 255, 0.95)',
                    borderColor: theme.colors.border,
                    shadowColor: theme.colors.shadow,
                  },
                  containerStyle,
                ]}
              >
                <View style={styles.header}>
                  <Text variant="h2">Quick Add</Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.closeButton}
                  >
                    <Icon
                      name="close"
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.typeSelector}>
                  {renderTypeButton('task', 'Task', 'checkmark-circle-outline')}
                  {renderTypeButton('project', 'Project', 'folder-outline')}
                  {renderTypeButton('team', 'Team', 'people-outline')}
                </View>

                <View style={styles.formContainer}>
                  <InputField
                    label={`${
                      itemType.charAt(0).toUpperCase() + itemType.slice(1)
                    } Title`}
                    placeholder={`Enter ${itemType} title`}
                    value={title}
                    onChangeText={setTitle}
                    leftIcon={
                      itemType === 'task'
                        ? 'checkmark-circle-outline'
                        : itemType === 'project'
                        ? 'folder-outline'
                        : 'people-outline'
                    }
                  />

                  {itemType === 'task' && (
                    <Dropdown
                      label="Project"
                      placeholder="Select a project"
                      items={projects}
                      value={selectedProject}
                      onValueChange={(value) => setSelectedProject(value)}
                      leftIcon="folder-outline"
                    />
                  )}

                  <InputField
                    label="Description (Optional)"
                    placeholder={`Enter ${itemType} description`}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    leftIcon="document-text-outline"
                    inputStyle={{ height: 80, textAlignVertical: 'top' }}
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    title="Advanced..."
                    onPress={handleAdvancedCreate}
                    variant="outline"
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    title="Create"
                    onPress={handleCreate}
                    loading={isLoading}
                    style={{ flex: 2 }}
                  />
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    flex: 1,
  },
  formContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});