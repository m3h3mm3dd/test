import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from '../UI/Text';
import { Button } from '../UI/Button';
import { IconButton } from '../UI/IconButton';
import Icon from 'react-native-vector-icons/Ionicons';

interface FilterOption {
  label: string;
  value: any;
}

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  filters: any;
  onApplyFilters: (filters: any) => void;
  filterOptions: {
    [key: string]: FilterOption[];
  };
}

export const FilterModal = ({
  isVisible,
  onClose,
  filters,
  onApplyFilters,
  filterOptions,
}: FilterModalProps) => {
  const { theme } = useTheme();
  const [localFilters, setLocalFilters] = useState({ ...filters });
  const translateY = useSharedValue(300);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      });
    } else {
      translateY.value = withTiming(300, {
        duration: 300,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      });
    }
  }, [isVisible, translateY]);

  useEffect(() => {
    setLocalFilters({ ...filters });
  }, [filters]);

  const handleClose = () => {
    translateY.value = withTiming(
      300,
      {
        duration: 300,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      },
      () => {
        runOnJS(onClose)();
      }
    );
  };

  const handleReset = () => {
    // Reset to default values
    const resetFilters = {};
    Object.keys(filterOptions).forEach(key => {
      // Find the option with null value or the first option
      const defaultOption = filterOptions[key].find(option => option.value === null) || filterOptions[key][0];
      resetFilters[key] = defaultOption.value;
    });
    
    setLocalFilters(resetFilters);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleSelectOption = (key: string, value: any) => {
    setLocalFilters({
      ...localFilters,
      [key]: value,
    });
  };

  const modalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const renderFilterSection = (title: string, key: string, options: FilterOption[]) => (
    <View style={styles.section}>
      <Text variant="h3" style={styles.sectionTitle}>
        {title}
      </Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={`${key}-${option.value}`}
            style={[
              styles.optionButton,
              {
                backgroundColor:
                  localFilters[key] === option.value
                    ? theme.colors.primary
                    : 'transparent',
                borderColor:
                  localFilters[key] === option.value
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
            onPress={() => handleSelectOption(key, option.value)}
          >
            <Text
              variant="button"
              style={{
                color:
                  localFilters[key] === option.value
                    ? 'white'
                    : theme.colors.text,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} animationType="none">
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
                modalStyle,
              ]}
            >
              <View style={styles.header}>
                <Text variant="h2">Filters</Text>
                <IconButton
                  name="close"
                  onPress={handleClose}
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </View>

              <ScrollView style={styles.content}>
                {Object.keys(filterOptions).map((key) => (
                  renderFilterSection(
                    key.charAt(0).toUpperCase() + key.slice(1),
                    key,
                    filterOptions[key]
                  )
                ))}
              </ScrollView>

              <View style={styles.footer}>
                <Button
                  title="Reset"
                  onPress={handleReset}
                  variant="outline"
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Apply"
                  onPress={handleApply}
                  style={{ flex: 2 }}
                />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  content: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});