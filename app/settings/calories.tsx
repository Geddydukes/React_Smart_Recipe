import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';

type DailyCalories = Database['public']['Tables']['daily_calories']['Row'];

export default function CalorieSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetCalories, setTargetCalories] = useState(2000);

  useEffect(() => {
    fetchDailyCalories();
  }, []);

  const fetchDailyCalories = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_calories')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setTargetCalories(data.target_calories);
      }
    } catch (error) {
      console.error('Error fetching daily calories:', error);
      setError('Failed to load calorie settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('daily_calories').upsert({
        user_id: user.id,
        date: today,
        target_calories: targetCalories,
      });

      if (error) throw error;
      router.back();
    } catch (error) {
      console.error('Error saving calorie settings:', error);
      setError('Failed to save calorie settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.title}>Calorie Settings</Text>
        <Pressable onPress={handleSave} disabled={saving}>
          <Save size={24} color="#6366F1" />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Daily Calorie Goal</Text>
            <TextInput
              style={styles.input}
              value={targetCalories.toString()}
              onChangeText={(text) => setTargetCalories(parseInt(text) || 0)}
              keyboardType="numeric"
              placeholder="Enter target calories"
            />
            <Text style={styles.helpText}>
              Set your daily calorie goal to track your progress
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.infoTitle}>About Calorie Goals</Text>
            <Text style={styles.infoText}>
              Your daily calorie goal helps you maintain a healthy diet and
              achieve your fitness objectives. The app will track your progress
              throughout the day and show you how close you are to your goal.
            </Text>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
  },
  info: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
  },
});
