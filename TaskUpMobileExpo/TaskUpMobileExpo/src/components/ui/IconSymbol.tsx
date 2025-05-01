import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Symbol } from 'expo-symbols'

interface IconSymbolProps {
  name: string
  color: string 
  size?: number
  style?: ViewStyle
}

export function IconSymbol({ name, color, size = 24, style }: IconSymbolProps) {
  return (
    <View style={[styles.container, style]} accessibilityRole="image">
      <Symbol name={name} color={color} size={size} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})