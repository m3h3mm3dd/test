import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../../Hooks/UseTheme';
import Icon from 'react-native-vector-icons/Ionicons';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
}

export const EmptyState = ({ title, message, icon = 'information-circle-outline' }: EmptyStateProps) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Icon 
        name={icon} 
        size={64} 
        color={theme.colors.textSecondary}
        style={styles.icon}
      />
      <Text variant="h2" style={styles.title}>
        {title}
      </Text>
      <Text 
        variant="body" 
        style={[styles.message, { color: theme.colors.textSecondary }]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    maxWidth: '80%',
  },
});