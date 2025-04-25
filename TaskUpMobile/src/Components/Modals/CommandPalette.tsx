import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Keyboard,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from '../UI/Text';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/Ionicons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CommandOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  tags: string[];
}

interface CommandPaletteProps {
  isVisible: boolean;
  onClose: () => void;
}

export const CommandPalette = ({ isVisible, onClose }: CommandPaletteProps) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const progress = useSharedValue(0);
  const translateY = useSharedValue(40);

  const initialOptions: CommandOption[] = [
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      description: 'Navigate to the dashboard',
      icon: 'home',
      action: () => navigation.navigate('Dashboard'),
      tags: ['dashboard', 'home', 'main'],
    },
    {
      id: 'projects',
      title: 'View All Projects',
      description: 'See all your projects',
      icon: 'folder',
      action: () => navigation.navigate('Projects'),
      tags: ['projects', 'view', 'list'],
    },
    {
      id: 'new-project',
      title: 'Create New Project',
      description: 'Start a new project',
      icon: 'add-circle',
      action: () => navigation.navigate('CreateProject'),
      tags: ['new', 'create', 'project', 'add'],
    },
    {
      id: 'tasks',
      title: 'View All Tasks',
      description: 'See all your tasks',
      icon: 'list',
      action: () => navigation.navigate('Tasks'),
      tags: ['tasks', 'todo', 'list'],
    },
    {
      id: 'new-task',
      title: 'Create New Task',
      description: 'Add a new task',
      icon: 'checkmark-circle',
      action: () => navigation.navigate('CreateTask'),
      tags: ['new', 'create', 'task', 'add'],
    },
    {
      id: 'teams',
      title: 'View Teams',
      description: 'See all your teams',
      icon: 'people',
      action: () => navigation.navigate('Teams'),
      tags: ['teams', 'people', 'group'],
    },
    {
      id: 'profile',
      title: 'My Profile',
      description: 'View your profile',
      icon: 'person',
      action: () => navigation.navigate('Profile'),
      tags: ['profile', 'account', 'me', 'user'],
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Adjust app settings',
      icon: 'settings',
      action: () => navigation.navigate('Settings'),
      tags: ['settings', 'preferences', 'options'],
    },
    {
      id: 'dark-mode',
      title: 'Toggle Dark Mode',
      description: 'Switch between light and dark mode',
      icon: 'moon',
      action: () => {},
      tags: ['theme', 'dark', 'light', 'mode', 'toggle'],
    },
    {
      id: 'logout',
      title: 'Log Out',
      description: 'Sign out of your account',
      icon: 'log-out',
      action: () => {},
      tags: ['logout', 'sign out', 'exit'],
    },
  ];

  const [filteredOptions, setFilteredOptions] = useState(initialOptions);

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
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      progress.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      });
      translateY.value = withTiming(40, {
        duration: 300,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      });
    }
  }, [isVisible, progress, translateY]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = initialOptions.filter(
        (option) =>
          option.title.toLowerCase().includes(query) ||
          option.description.toLowerCase().includes(query) ||
          option.tags.some((tag) => tag.toLowerCase().includes(query))
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(initialOptions);
    }
  }, [searchQuery]);

  const handleOptionPress = (option: CommandOption) => {
    onClose();
    
    setTimeout(() => {
      option.action();
    }, 300);
  };

  const handleKeyPress = (e: any) => {
    const { key } = e.nativeEvent;
    if (key === 'Escape') {
      onClose();
    }
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
          translateY: interpolate(
            progress.value,
            [0, 1],
            [-100, 0],
            Extrapolation.CLAMP
          ),
        },
      ],
      opacity: progress.value,
    };
  });

  const renderItem = ({ item }: { item: CommandOption }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        { backgroundColor: theme.colors.card }
      ]}
      onPress={() => handleOptionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.optionIconContainer}>
        <Icon name={item.icon} size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.optionContent}>
        <Text variant="subtitle" style={{ color: theme.colors.text }}>
          {item.title}
        </Text>
        <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
          {item.description}
        </Text>
      </View>
      <Icon 
        name="chevron-forward" 
        size={18} 
        color={theme.colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      onRequestClose={onClose}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <BlurView
            style={StyleSheet.absoluteFillObject}
            blurType={theme.isDarkMode ? 'dark' : 'light'}
            blurAmount={8}
          />
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View
              style={[
                styles.container,
                {
                  backgroundColor: theme.isDarkMode
                    ? 'rgba(30, 30, 30, 0.95)'
                    : 'rgba(255, 255, 255, 0.95)',
                  shadowColor: theme.colors.shadow,
                },
                containerStyle,
              ]}
            >
              <View style={styles.header}>
                <View style={styles.searchContainer}>
                  <Icon
                    name="search"
                    size={20}
                    color={theme.colors.textSecondary}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    ref={inputRef}
                    style={[
                      styles.searchInput,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.fonts.regular,
                      },
                    ]}
                    placeholder="Search commands..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onKeyPress={handleKeyPress}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      style={styles.clearButton}
                    >
                      <Icon
                        name="close-circle"
                        size={16}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Icon
                    name="close"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <FlatList
                data={filteredOptions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon
                      name="search-outline"
                      size={48}
                      color={theme.colors.textSecondary}
                      style={styles.emptyIcon}
                    />
                    <Text
                      variant="subtitle"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      No results found
                    </Text>
                  </View>
                }
              />

              <View style={styles.footer}>
                <View style={styles.shortcutContainer}>
                  <View
                    style={[
                      styles.shortcutKey,
                      { backgroundColor: theme.colors.border },
                    ]}
                  >
                    <Text
                      variant="caption"
                      style={{ color: theme.colors.text }}
                    >
                      ↑↓
                    </Text>
                  </View>
                  <Text
                    variant="caption"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    to navigate
                  </Text>
                </View>

                <View style={styles.shortcutContainer}>
                  <View
                    style={[
                      styles.shortcutKey,
                      { backgroundColor: theme.colors.border },
                    ]}
                  >
                    <Text
                      variant="caption"
                      style={{ color: theme.colors.text }}
                    >
                      Enter
                    </Text>
                  </View>
                  <Text
                    variant="caption"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    to select
                  </Text>
                </View>

                <View style={styles.shortcutContainer}>
                  <View
                    style={[
                      styles.shortcutKey,
                      { backgroundColor: theme.colors.border },
                    ]}
                  >
                    <Text
                      variant="caption"
                      style={{ color: theme.colors.text }}
                    >
                      Esc
                    </Text>
                  </View>
                  <Text
                    variant="caption"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    to close
                  </Text>
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  optionContent: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  shortcutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  shortcutKey: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.6,
  },
});