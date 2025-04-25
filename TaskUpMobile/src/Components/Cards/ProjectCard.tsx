import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from '../UI/Text';
import { ProgressBar } from '../UI/ProgressBar';
import { Badge } from '../UI/Badge';
import { DateUtils } from '../../Utils/DateUtils';
import Icon from 'react-native-vector-icons/Ionicons';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string;
    progress: number;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
    deadline: string;
    taskCount: number;
    teamCount: number;
  };
  variant?: 'default' | 'horizontal' | 'minimal';
}

export const ProjectCard = ({ project, variant = 'default' }: ProjectCardProps) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const scale = useSharedValue(1);

  const handlePress = () => {
    navigation.navigate('ProjectDetail', { projectId: project.id });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started':
        return theme.colors.warning;
      case 'In Progress':
        return theme.colors.info;
      case 'Completed':
        return theme.colors.success;
      case 'On Hold':
        return theme.colors.error;
      default:
        return theme.colors.info;
    }
  };

  const isDeadlineClose = () => {
    const deadlineDate = new Date(project.deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const isDeadlinePassed = () => {
    const deadlineDate = new Date(project.deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  if (variant === 'horizontal') {
    return (
      <AnimatedTouchable
        style={[
          styles.horizontalContainer,
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
        <View style={styles.horizontalContent}>
          <View style={styles.horizontalHeader}>
            <Text variant="subtitle" numberOfLines={1} style={{ flex: 1 }}>
              {project.name}
            </Text>
            <Badge
              label={project.status}
              color={getStatusColor(project.status)}
              size="small"
            />
          </View>

          <ProgressBar progress={project.progress / 100} style={styles.progressBar} />

          <View style={styles.horizontalFooter}>
            <View style={styles.iconInfoContainer}>
              <Icon name="calendar-outline" size={14} color={theme.colors.textSecondary} />
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
                {DateUtils.formatDate(project.deadline)}
              </Text>
            </View>

            <View style={styles.iconInfoContainer}>
              <Icon name="checkmark-circle-outline" size={14} color={theme.colors.textSecondary} />
              <Text variant="caption" style={{ marginLeft: 4, color: theme.colors.textSecondary }}>
                {project.taskCount} tasks
              </Text>
            </View>

            <View style={styles.iconInfoContainer}>
              <Icon name="people-outline" size={14} color={theme.colors.textSecondary} />
              <Text variant="caption" style={{ marginLeft: 4, color: theme.colors.textSecondary }}>
                {project.teamCount} members
              </Text>
            </View>
          </View>
        </View>
      </AnimatedTouchable>
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
        <Text variant="subtitle" numberOfLines={1}>
          {project.name}
        </Text>
        
        <ProgressBar progress={project.progress / 100} style={styles.minimalProgress} />
        
        <View style={styles.minimalFooter}>
          <Badge
            label={project.status}
            color={getStatusColor(project.status)}
            size="small"
          />
          
          <Text
            variant="caption"
            style={{
              color: isDeadlinePassed()
                ? theme.colors.error
                : isDeadlineClose()
                ? theme.colors.warning
                : theme.colors.textSecondary,
            }}
          >
            {DateUtils.formatDate(project.deadline)}
          </Text>
        </View>
      </AnimatedTouchable>
    );
  }

  return (
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
        <Text variant="h3" numberOfLines={1}>
          {project.name}
        </Text>
        <Badge
          label={project.status}
          color={getStatusColor(project.status)}
        />
      </View>

      {project.description && (
        <Text
          variant="body2"
          numberOfLines={2}
          style={[styles.description, { color: theme.colors.textSecondary }]}
        >
          {project.description}
        </Text>
      )}

      <View style={styles.progressContainer}>
        <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
          Progress
        </Text>
        <Text variant="caption" style={{ color: theme.colors.primary }}>
          {project.progress}%
        </Text>
      </View>
      <ProgressBar progress={project.progress / 100} style={styles.progressBar} />

      <View style={styles.footer}>
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
            {isDeadlinePassed() ? 'Overdue' : DateUtils.formatDate(project.deadline)}
          </Text>
        </View>

        <View style={styles.footerRight}>
          <View style={styles.iconInfoContainer}>
            <Icon name="checkmark-circle-outline" size={16} color={theme.colors.textSecondary} />
            <Text variant="caption" style={{ marginLeft: 6, color: theme.colors.textSecondary }}>
              {project.taskCount}
            </Text>
          </View>

          <View style={[styles.iconInfoContainer, { marginLeft: 12 }]}>
            <Icon name="people-outline" size={16} color={theme.colors.textSecondary} />
            <Text variant="caption" style={{ marginLeft: 6, color: theme.colors.textSecondary }}>
              {project.teamCount}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedTouchable>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBar: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  horizontalContainer: {
    width: 300,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    marginVertical: 8,
    borderWidth: 1,
  },
  horizontalContent: {
    flex: 1,
  },
  horizontalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  horizontalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  minimalContainer: {
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 2,
    marginVertical: 6,
    borderWidth: 1,
  },
  minimalProgress: {
    marginVertical: 8,
  },
  minimalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});