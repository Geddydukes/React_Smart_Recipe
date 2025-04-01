import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../../services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

interface NotificationPreferences {
  achievements: boolean;
  dailyReminders: boolean;
  weeklyProgress: boolean;
  systemUpdates: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  achievements: true,
  dailyReminders: true,
  weeklyProgress: true,
  systemUpdates: true,
};

export default function NotificationSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [systemPermission, setSystemPermission] = useState<boolean>(false);

  useEffect(() => {
    loadPreferences();
    checkSystemPermission();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('notificationPreferences');
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const checkSystemPermission = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setSystemPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    try {
      if (!systemPermission) {
        Alert.alert(
          'Notification Permission Required',
          'Please enable notifications in your device settings to use this feature.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openSettings();
                }
              },
            },
          ],
        );
        return;
      }

      const newPreferences = {
        ...preferences,
        [key]: !preferences[key],
      };

      await AsyncStorage.setItem(
        'notificationPreferences',
        JSON.stringify(newPreferences),
      );
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setError('Failed to save notification preferences');
    }
  };

  const handleRequestPermission = async () => {
    try {
      const { status } = await notificationService.requestPermissions();
      setSystemPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      setError('Failed to request notification permissions');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.title}>Notification Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {error && <Text style={styles.error}>{error}</Text>}

        {!systemPermission && (
          <View style={styles.permissionBanner}>
            <Text style={styles.permissionText}>
              Enable notifications to receive updates about your achievements
              and progress.
            </Text>
            <Pressable
              onPress={handleRequestPermission}
              style={({ pressed }) => [
                styles.permissionButton,
                pressed && styles.permissionButtonPressed,
              ]}
            >
              <Text style={styles.permissionButtonText}>
                Enable Notifications
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievement Notifications</Text>
          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Achievement Unlocks</Text>
              <Text style={styles.settingDescription}>
                Get notified when you unlock new achievements
              </Text>
            </View>
            <Switch
              value={preferences.achievements}
              onValueChange={() => handleToggle('achievements')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={preferences.achievements ? '#6366F1' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Updates</Text>
          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Daily Reminders</Text>
              <Text style={styles.settingDescription}>
                Receive daily reminders to log your meals
              </Text>
            </View>
            <Switch
              value={preferences.dailyReminders}
              onValueChange={() => handleToggle('dailyReminders')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={preferences.dailyReminders ? '#6366F1' : '#f4f3f4'}
            />
          </View>

          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Weekly Progress</Text>
              <Text style={styles.settingDescription}>
                Get a weekly summary of your nutrition progress
              </Text>
            </View>
            <Switch
              value={preferences.weeklyProgress}
              onValueChange={() => handleToggle('weeklyProgress')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={preferences.weeklyProgress ? '#6366F1' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Updates</Text>
          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>App Updates</Text>
              <Text style={styles.settingDescription}>
                Receive notifications about new features and improvements
              </Text>
            </View>
            <Switch
              value={preferences.systemUpdates}
              onValueChange={() => handleToggle('systemUpdates')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={preferences.systemUpdates ? '#6366F1' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can manage these settings at any time. Some notifications may be
            required for core app functionality.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  error: {
    color: '#ef4444',
    padding: 16,
    textAlign: 'center',
  },
  permissionBanner: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  permissionButton: {
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  permissionButtonPressed: {
    opacity: 0.9,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    padding: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
