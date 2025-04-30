
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChakraProvider } from '@chakra-ui/react';

// Import navigation
import AppNavigator from './AppNavigator';

// Import providers
import { ThemeProvider } from '@/theme/ThemeProvider';
import { AuthContext } from '@/context/AuthContext';
import { motion } from 'framer-motion';

/**
 * Root component that wraps the entire app with necessary providers
 */
const Navigation = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthContext>
            <StatusBar
              barStyle="dark-content"
              backgroundColor="transparent"
              translucent
            />
            <AppNavigator />
          </AuthContext>
        </ThemeProvider>
      </SafeAreaProvider>
    </motion.div>
  );
};

export default Navigation;