import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';

import TaskDashboard from '../components/Dashboard/TaskDashboard';
import Colors from '../theme/Colors';
import { useTheme } from '../hooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';

const HomeScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    // Smooth fade in animation
    opacity.value = withTiming(1, { duration: 500 });
    
    // Set appropriate status bar style
    StatusBar.setStyle(isDark ? 'light' : 'dark');
  }, []);
  
  const screenStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: colors.background.light }
      ]}
      edges={['left', 'right']}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <Animated.View 
        style={screenStyle}
        entering={FadeIn.duration(300)}
      >
        <TaskDashboard 
          navigation={navigation} 
          initialFilter="upcoming"
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  }
});

export default HomeScreen;