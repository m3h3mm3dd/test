import React from 'react'
import { StyleSheet, Text, View, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native'
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import Avatar from '../components/Avatar/Avatar'
import ListItem from '../components/ListItem/ListItem'

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)

const ProfileScreen = ({ navigation }) => {
  const userProfile = {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    completedTasks: 24,
    ongoingProjects: 3
  }

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    navigation.navigate('SettingsScreen')
  }

  const menuItems = [
    { id: '1', title: 'Account Details', icon: '👤' },
    { id: '2', title: 'Notifications', icon: '🔔' },
    { id: '3', title: 'Privacy & Security', icon: '🔒' },
    { id: '4', title: 'Help & Support', icon: '❓' },
    { id: '5', title: 'Settings', icon: '⚙️', onPress: handleSettingsPress },
    { id: '6', title: 'Logout', icon: '🚪' }
  ]

  return (
    <AnimatedSafeAreaView style={styles.container} entering={FadeIn}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={styles.profileHeader} entering={SlideInUp.delay(100)}>
          <Avatar size={80} />
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.completedTasks}</Text>
              <Text style={styles.statLabel}>Tasks Completed</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.ongoingProjects}</Text>
              <Text style={styles.statLabel}>Projects Active</Text>
            </View>
          </View>
        </Animated.View>
        
        <Animated.View style={styles.menuContainer} entering={SlideInUp.delay(200)}>
          <Text style={styles.menuTitle}>Menu</Text>
          
          {menuItems.map((item, index) => (
            <Animated.View 
              key={item.id} 
              entering={SlideInUp.delay(300 + (index * 50))}
              style={styles.menuItemContainer}
            >
              <ListItem
                title={item.title}
                leftIcon={<Text style={styles.menuIcon}>{item.icon}</Text>}
                onPress={item.onPress}
              />
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
    </AnimatedSafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  scrollContent: {
    padding: Spacing.lg
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl
  },
  userName: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginTop: Spacing.lg
  },
  userEmail: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray600,
    marginTop: Spacing.xs
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
    width: '100%',
    shadowColor: Colors.neutrals.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  separator: {
    width: 1,
    backgroundColor: Colors.neutrals.gray300,
    height: '100%'
  },
  statValue: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.primary.blue
  },
  statLabel: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginTop: Spacing.xs
  },
  menuContainer: {
    marginTop: Spacing.xl
  },
  menuTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray800,
    marginBottom: Spacing.md
  },
  menuItemContainer: {
    marginBottom: Spacing.sm
  },
  menuIcon: {
    fontSize: 20
  }
})

export default ProfileScreen