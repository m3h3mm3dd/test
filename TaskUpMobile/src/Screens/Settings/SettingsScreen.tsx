import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Hooks/UseTheme';
import { useAuth } from '../../Hooks/UseAuth';
import { Text } from '../../Components/UI/Text';
import { Card } from '../../Components/UI/Card';
import { IconButton } from '../../Components/UI/IconButton';
import Icon from 'react-native-vector-icons/Ionicons';

export const SettingsScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.primary + '15' },
          ]}
        >
          <Icon name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.settingTexts}>
          <Text variant="subtitle">{title}</Text>
          <Text
            variant="body2"
            style={{ color: theme.colors.textSecondary }}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      {rightElement || (
        <Icon
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h2" style={styles.sectionTitle}>
          Appearance
        </Text>
        <Card style={styles.card}>
          {renderSettingItem(
            'moon-outline',
            'Dark Mode',
            'Toggle between light and dark themes',
            () => {},
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary + '70',
              }}
              thumbColor={isDarkMode ? theme.colors.primary : '#f4f3f4'}
            />
          )}
        </Card>

        <Text variant="h2" style={styles.sectionTitle}>
          Account
        </Text>
        <Card style={styles.card}>
          {renderSettingItem(
            'person-outline',
            'Profile',
            'Edit your personal information',
            () => navigation.navigate('EditProfile')
          )}
          {renderSettingItem(
            'notifications-outline',
            'Notifications',
            'Manage notification preferences',
            () => navigation.navigate('NotificationSettings')
          )}
          {renderSettingItem(
            'lock-closed-outline',
            'Security',
            'Password and authentication',
            () => navigation.navigate('SecuritySettings')
          )}
        </Card>

        <Text variant="h2" style={styles.sectionTitle}>
          App
        </Text>
        <Card style={styles.card}>
          {renderSettingItem(
            'cloud-outline',
            'Data Sync',
            'Manage offline data syncing',
            () => navigation.navigate('DataSync')
          )}
          {renderSettingItem(
            'information-circle-outline',
            'About',
            'App version and information',
            () => navigation.navigate('About')
          )}
          {renderSettingItem(
            'help-circle-outline',
            'Help & Support',
            'Get assistance and report issues',
            () => navigation.navigate('Help')
          )}
        </Card>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            { borderColor: theme.colors.error },
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Icon name="log-out-outline" size={20} color={theme.colors.error} />
          <Text
            variant="button"
            style={{
              color: theme.colors.error,
              marginLeft: 8,
            }}
          >
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
  },
  card: {
    padding: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTexts: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
});