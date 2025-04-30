import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, FlatList } from 'react-native';
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import Spacing from '../theme/Spacing';
import ListItem from '../components/ListItem/ListItem';
import PrimaryButton from '../components/Button/Button';
import SkeletonLoader from '../components/Skeleton/SkeletonLoader';
import { useTheme } from '../theme/ThemeProvider';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

const ProjectScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setProjects([
        { id: '1', title: 'Mobile App Redesign', tasksCount: 8, progress: 0.4 },
        { id: '2', title: 'Website Development', tasksCount: 12, progress: 0.7 },
        { id: '3', title: 'Marketing Campaign', tasksCount: 5, progress: 0.2 }
      ]);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleProjectPress = (projectId) => {
    navigation.navigate('ProjectDetailsScreen', { projectId });
  };

  const handleNewProject = () => {
    // Navigate to create new project screen
    navigation.navigate('NewProjectScreen');
  };

  const renderProjectItem = ({ item }) => (
    <Animated.View entering={SlideInLeft.delay(parseInt(item.id) * 100).duration(300)}>
      <ListItem
        title={item.title}
        subtitle={`${item.tasksCount} tasks`}
        rightIcon={<ProgressIndicator progress={item.progress} />}
        onPress={() => handleProjectPress(item.id)}
      />
    </Animated.View>
  );

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
  );

  return (
    <AnimatedSafeAreaView 
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      entering={FadeIn.duration(400)}
    >
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background.primary} />
      
      <Animated.View style={styles.header} entering={SlideInLeft.delay(100).duration(300)}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Projects</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>Manage your projects</Text>
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

      <Animated.View style={styles.footer} entering={SlideInLeft.delay(300).duration(300)}>
        <PrimaryButton
          title="New Project"
          onPress={handleNewProject}
          fullWidth
          icon="plus"
        />
      </Animated.View>
    </AnimatedSafeAreaView>
  );
};

// Helper component for progress
const ProgressIndicator = ({ progress }) => {
  const { theme } = useTheme();
  
  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressTrack, { backgroundColor: theme.neutrals.gray200 }]}>
        <View 
          style={[
            styles.progressFill,
            { 
              width: `${progress * 100}%`,
              backgroundColor: theme.primary.main
            }
          ]} 
        />
      </View>
      <Text style={[styles.progressText, { color: theme.text.secondary }]}>{`${Math.round(progress * 100)}%`}</Text>
    </View>
  );
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
  progressContainer: {
    alignItems: 'center'
  },
  progressTrack: {
    width: 60,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 3
  },
  progressText: {
    fontSize: Typography.sizes.caption,
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
});

export default ProjectScreen;