import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from '../UI/Text';
import Icon from 'react-native-vector-icons/Ionicons';

interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  placeholder: string;
  items: DropdownItem[];
  value: string | null;
  onValueChange: (value: string) => void;
  leftIcon?: string;
  error?: string;
  disabled?: boolean;
}

export const Dropdown = ({
  label,
  placeholder,
  items,
  value,
  onValueChange,
  leftIcon,
  error,
  disabled = false,
}: DropdownProps) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const rotate = useSharedValue(0);

  const toggleDropdown = () => {
    if (disabled) return;
    
    setIsOpen(!isOpen);
    setIsFocused(!isOpen);
    rotate.value = withTiming(isOpen ? 0 : 1, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setIsFocused(false);
    rotate.value = withTiming(0, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  const handleSelectItem = (item: DropdownItem) => {
    onValueChange(item.value);
    closeDropdown();
  };

  const getSelectedItemLabel = () => {
    const selectedItem = items.find((item) => item.value === value);
    return selectedItem ? selectedItem.label : placeholder;
  };

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotate.value * 180}deg`,
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {label && (
        <Text
          variant="caption"
          style={[
            styles.label,
            {
              color: error
                ? theme.colors.error
                : isFocused
                ? theme.colors.primary
                : theme.colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.7}
        onPress={toggleDropdown}
        style={[
          styles.dropdownButton,
          {
            borderColor: error
              ? theme.colors.error
              : isFocused
              ? theme.colors.primary
              : theme.colors.border,
            backgroundColor: disabled ? theme.colors.border + '30' : theme.colors.card,
            paddingLeft: leftIcon ? 40 : 16,
          },
        ]}
      >
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={
              error
                ? theme.colors.error
                : isFocused
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
            style={styles.leftIcon}
          />
        )}

        <Text
          style={[
            styles.selectedText,
            {
              color: value 
                ? theme.colors.text 
                : theme.colors.textSecondary
            },
          ]}
        >
          {getSelectedItemLabel()}
        </Text>

        <Animated.View style={iconAnimatedStyle}>
          <Icon
            name="chevron-down"
            size={20}
            color={
              error
                ? theme.colors.error
                : isFocused
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
          />
        </Animated.View>
      </TouchableOpacity>

      {error && (
        <Text
          variant="caption"
          style={{ color: theme.colors.error, marginTop: 4 }}
        >
          {error}
        </Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.dropdown,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  ...theme.shadows.medium,
                },
              ]}
            >
              <FlatList
                data={items}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      item.value === value && {
                        backgroundColor: theme.colors.primary + '20',
                      },
                    ]}
                    onPress={() => handleSelectItem(item)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        {
                          color:
                            item.value === value
                              ? theme.colors.primary
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.value === value && (
                      <Icon
                        name="checkmark"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  dropdownButton: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdown: {
    width: '80%',
    maxHeight: 300,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dropdownItemText: {
    fontSize: 16,
  },
});