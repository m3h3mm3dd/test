import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity
} from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import Spacing from '../theme/Spacing';

import ListItem from '../components/ListItem/ListItem';
import Button from '../components/Button/Button'; // ✅ fixed import
import SkeletonLoader from '../components/Skeleton/SkeletonLoader';
import { triggerImpact } from '../utils/HapticUtils';
import { useTheme } from '../theme/ThemeProvider';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setTasks([
        { id: '1', title: 'Complete mobile design', status: 'in-progress', dueDate: '2025-05-10' },
        { id: '2', title: 'Review project proposal', status: 'pending', dueDate: '2025-05-12' },
        { id: '3', title: 'Team meeting', status: 'completed', dueDate: '2025-05-08' }
      ]);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleTaskPress = (taskId) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('TaskDetailsScreen', { taskId });
  };

  const handleAddTask = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('TaskScreen', { isNew: true });
  };

  const renderTaskItem = ({ item }) => (
    <Animated.View entering={FadeInUp.delay(parseInt(item.id) * 100).duration(300)}>
      <ListItem
        title={item.title}
        subtitle={`Due: ${item.dueDate}`}
        onPress={() => handleTaskPress(item.id)}
        rightIcon={<StatusDot status={item.status} />}
      />
    </Animated.View>
  );

  const renderSkeletons = () => (
    <>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonContainer}>
          <SkeletonLoader width={'70%'} height={24} borderRadius={4} />
          <SkeletonLoader
            width={'40%'}
            height={16}
            borderRadius={4}
            style={styles.skeletonSubtitle}
          />
        </View>
      ))}
    </>
  );

  return (
    <AnimatedSafeAreaView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      entering={FadeInDown.duration(400)}
    >
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background.primary}
      />

      <Animated.View style={styles.header} entering={FadeInDown.delay(100).duration(400)}>
        <Text style={[styles.title, { color: theme.text.primary }]}>TaskUp</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Your daily tasks
        </Text>
      </Animated.View>

      <View style={styles.content}>
        {loading ? (
          renderSkeletons()
        ) : (
          <FlatList
            data={tasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Animated.View style={styles.footer} entering={FadeInUp.delay(300).duration(400)}>
        <Button
          title="Add New Task"
          onPress={handleAddTask}
          fullWidth
          icon="plus"
        />
      </Animated.View>
    </AnimatedSafeAreaView>
  );
};

// Helper component for task status
const StatusDot = ({ status }) => {
  const { theme } = useTheme();

  const getColor = () => {
    switch (status) {
      case 'completed':
        return theme.status.success;
      case 'in-progress':
        return theme.primary.main;
      case 'pending':
        return theme.status.warning;
      default:
        return theme.neutrals.gray400;
    }
  };

  return <View style={[styles.statusDot, { backgroundColor: getColor() }]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold
  },
  subtitle: {
    fontSize: Typography.sizes.body,
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
});

export default HomeScreen;
