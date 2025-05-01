import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, Link } from 'expo-router';
import Colors from '../src/theme/Colors';
import Typography from '../src/theme/Typography';
import Spacing from '../src/theme/Spacing';

export default function Home() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'TaskUp App' }} />
      
      <Text style={styles.title}>Welcome to TaskUp</Text>
      <Text style={styles.subtitle}>Your task management solution</Text>
      
      <View style={styles.buttonContainer}>
        <Link href="/tasks" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Tasks</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/projects" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Projects</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/profile" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background.light
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginBottom: Spacing.sm
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray600,
    marginBottom: Spacing.xl
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md
  },
  button: {
    backgroundColor: Colors.primary.blue,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: Colors.neutrals.white,
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium
  }
});