// src/components/Debug/DebugView.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';

interface DebugViewProps {
  label: string;
  data?: any;
}

const DebugView = ({ label, data }: DebugViewProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView style={styles.dataContainer}>
        <Text style={styles.data}>
          {typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  label: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginBottom: 8
  },
  dataContainer: {
    maxHeight: 200
  },
  data: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray800,
    fontFamily: 'monospace'
  }
});

export default DebugView;