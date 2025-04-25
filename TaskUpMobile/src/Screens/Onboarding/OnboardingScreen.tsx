import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  useDerivedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from '../../Components/UI/Text';
import { Button } from '../../Components/UI/Button';
import { StorageUtils } from '../../Utils/StorageUtils';
import Icon from 'react-native-vector-icons/Ionicons';

const slides = [
  {
    id: '1',
    title: 'Welcome to TaskUp',
    description:
      'A minimalist, smooth, and futuristic project management tool designed to optimize your workflow.',
    image: require('../../Assets/Images/Onboarding1.png'),
    icon: 'checkmark-circle-outline',
  },
  {
    id: '2',
    title: 'Organize Projects & Tasks',
    description:
      'Create and manage projects, organize tasks, set deadlines, and track progress all in one place.',
    image: require('../../Assets/Images/Onboarding2.png'),
    icon: 'folder-outline',
  },
  {
    id: '3',
    title: 'Collaborate With Teams',
    description:
      'Work seamlessly with your team, assign tasks, share updates, and communicate in real-time.',
    image: require('../../Assets/Images/Onboarding3.png'),
    icon: 'people-outline',
  },
];

export const OnboardingScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const handleSkip = async () => {
    await StorageUtils.setOnboardingStatus(true);
    navigation.navigate('Auth');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    await StorageUtils.setOnboardingStatus(true);
    navigation.navigate('Auth');
  };

  const progress = useDerivedValue(() => {
    return scrollX.value / width;
  });

  const backgroundColorStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1, 2],
        [
          theme.isDarkMode ? '#101010' : '#F9F9F9',
          theme.isDarkMode ? '#0E1217' : '#F0F4FF',
          theme.isDarkMode ? '#121620' : '#F0FFF4',
        ]
      ),
    };
  });

  const renderItem = ({ item, index }: any) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const imageAnimatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0, 1, 0],
        Extrapolation.CLAMP
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0, 1, 0],
        Extrapolation.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        scrollX.value,
        inputRange,
        [20, 0, -20],
        Extrapolation.CLAMP
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0, 1, 0],
        Extrapolation.CLAMP
      );

      return {
        transform: [{ translateY }],
        opacity,
      };
    });

    return (
      <View style={[styles.slide, { width }]}>
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <View 
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.primary + '20' },
            ]}
          >
            <Icon
              name={item.icon}
              size={100}
              color={theme.colors.primary}
            />
          </View>
        </Animated.View>
        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          <Text variant="h1" style={styles.title}>
            {item.title}
          </Text>
          <Text
            variant="body"
            style={[styles.description, { color: theme.colors.textSecondary }]}
          >
            {item.description}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <Animated.View
      style={[styles.container, backgroundColorStyle]}
    >
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
      >
        <Text
          variant="button"
          style={{ color: theme.colors.primary }}
        >
          Skip
        </Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          scrollX.value = event.nativeEvent.contentOffset.x;
        }}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => {
            const dotAnimatedStyle = useAnimatedStyle(() => {
              const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];

              const width = interpolate(
                scrollX.value,
                inputRange,
                [8, 24, 8],
                Extrapolation.CLAMP
              );

              const opacity = interpolate(
                scrollX.value,
                inputRange,
                [0.5, 1, 0.5],
                Extrapolation.CLAMP
              );

              return {
                width,
                opacity,
              };
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: theme.colors.primary },
                  dotAnimatedStyle,
                ]}
              />
            );
          })}
        </View>

        <Button
          title={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
          rightIcon={currentIndex === slides.length - 1 ? undefined : "arrow-forward"}
          style={styles.button}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    marginBottom: 20,
  },
});