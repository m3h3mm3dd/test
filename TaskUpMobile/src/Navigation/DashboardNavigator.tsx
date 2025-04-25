import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProjectNavigator } from './ProjectNavigator';
import { TaskNavigator } from './TaskNavigator';
import { TeamNavigator } from './TeamNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { DashboardScreen } from '../Screens/Dashboard/DashboardScreen';
import { useTheme } from '../Hooks/UseTheme';
import { TabBar } from '../Components/Navigation/TabBar';
import { useNotification } from '../Contexts/NotificationContext';
import { CommandPalette } from '../Components/Modals/CommandPalette';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

export const DashboardNavigator = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { hasNotifications } = useNotification();
  const [showCommandPalette, setShowCommandPalette] = React.useState(false);

  const toggleCommandPalette = () => {
    setShowCommandPalette(!showCommandPalette);
  };

  React.useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        toggleCommandPalette();
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        tabBar={props => <TabBar {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontFamily: theme.fonts.medium,
            fontSize: 18,
          },
          tabBarStyle: {
            position: 'absolute',
            bottom: insets.bottom,
            left: width * 0.05,
            right: width * 0.05,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.colors.card,
            borderTopWidth: 0,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
          }
        }}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Icon name={focused ? "home" : "home-outline"} size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Projects" 
          component={ProjectNavigator} 
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon name={focused ? "folder" : "folder-outline"} size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Tasks" 
          component={TaskNavigator} 
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon name={focused ? "list" : "list-outline"} size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Teams" 
          component={TeamNavigator} 
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon name={focused ? "people" : "people-outline"} size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileNavigator} 
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View>
                <Icon name={focused ? "person" : "person-outline"} size={24} color={color} />
                {hasNotifications && (
                  <View style={[styles.notificationDot, { backgroundColor: theme.colors.notification }]} />
                )}
              </View>
            ),
          }}
        />
      </Tab.Navigator>
      
      {showCommandPalette && (
        <CommandPalette 
          isVisible={showCommandPalette} 
          onClose={toggleCommandPalette} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});