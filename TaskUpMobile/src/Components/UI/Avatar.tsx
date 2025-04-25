import React from 'react';
import { StyleSheet, View, Image, ViewStyle } from 'react-native';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from './Text';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar = ({ uri, name, size = 40, style }: AvatarProps) => {
  const { theme } = useTheme();

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name.substring(0, 2);
  };

  const getRandomColor = (name: string) => {
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.info,
      theme.colors.success,
      theme.colors.warning,
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: uri ? 'transparent' : getRandomColor(name),
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      ) : (
        <Text
          variant="button"
          style={{
            color: 'white',
            fontSize: size * 0.4,
          }}
        >
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});