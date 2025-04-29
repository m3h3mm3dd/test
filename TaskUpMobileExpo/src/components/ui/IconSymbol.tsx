import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Symbol } from 'expo-symbols';

export function IconSymbol({ name, color, size = 24 }) {
  return (
    <View style={styles.container}>
      <Symbol name={name} color={color} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});