// src/screens/TestScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import Colors from '../theme/Colors';
import Typography from '../theme/Typography';

const TestScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Screen</Text>
      <Text style={styles.subtitle}>If you can see this, the app is working!</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Go to Home" 
          onPress={() => navigation.navigate('HomeScreen')} 
          color={Colors.primary.blue}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background.light
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginBottom: 12
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray700,
    textAlign: 'center',
    marginBottom: 40
  },
  buttonContainer: {
    marginTop: 20
  }
});

export default TestScreen;