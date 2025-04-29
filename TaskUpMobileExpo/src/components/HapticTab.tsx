import React from 'react';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';

export function HapticTab(props: React.ComponentProps<typeof Tabs.Tab>) {
  return (
    <Tabs.Tab
      {...props}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPress?.(e);
      }}
    />
  );
}