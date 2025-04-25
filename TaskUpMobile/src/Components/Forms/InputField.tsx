import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from '../UI/Text';
import Icon from 'react-native-vector-icons/Ionicons';

interface InputFieldProps extends TextInputProps {
  label?: string;
  leftIcon?: string;
  rightIcon?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  onRightIconPress?: () => void;
}

export const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  rightIcon,
  error,
  secureTextEntry,
  containerStyle,
  inputStyle,
  labelStyle,
  onRightIconPress,
  ...rest
}: InputFieldProps) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const labelAnim = useState(new Animated.Value(value ? 1 : 0))[0];
  const inputRef = React.useRef<TextInput>(null);

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, labelAnim]);

  const labelStyle1 = {
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.textSecondary, theme.colors.primary],
    }),
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleLabelPress = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleLabelPress}
          style={styles.labelContainer}
        >
          <Animated.Text
            style={[
              styles.label,
              {
                top: labelStyle1.top,
                fontSize: labelStyle1.fontSize,
                color: error ? theme.colors.error : labelStyle1.color,
              },
              labelStyle,
            ]}
          >
            {label}
          </Animated.Text>
        </TouchableOpacity>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? theme.colors.error
              : isFocused
              ? theme.colors.primary
              : theme.colors.border,
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

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={isFocused ? placeholder : ''}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontFamily: theme.fonts.regular,
              paddingRight: secureTextEntry || rightIcon ? 40 : 16,
            },
            inputStyle,
          ]}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
          >
            <Icon
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Icon name={rightIcon} size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text
          variant="caption"
          style={{ color: theme.colors.error, marginTop: 4 }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelContainer: {
    height: 20,
    marginBottom: 8,
  },
  label: {
    position: 'absolute',
    left: 0,
  },
  inputContainer: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
});