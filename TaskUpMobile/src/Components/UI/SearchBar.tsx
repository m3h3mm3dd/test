import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../Hooks/UseTheme';
import Icon from 'react-native-vector-icons/Ionicons';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  style?: any;
}

export const SearchBar = ({
  placeholder,
  value,
  onChangeText,
  onClear,
  style,
}: SearchBarProps) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      <Icon
        name="search-outline"
        size={20}
        color={theme.colors.textSecondary}
        style={styles.searchIcon}
      />
      
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
            fontFamily: theme.fonts.regular,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
      />
      
      {value.length > 0 && onClear && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Icon
            name="close-circle"
            size={16}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
});