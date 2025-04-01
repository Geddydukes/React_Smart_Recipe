import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { socialService } from '../../services/social';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../../store/recipe';

export default function SocialScreen() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const router = useRouter();
  const { createRecipe } = useRecipeStore();

  const handleImport = async () => {
    if (!url) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const recipe = await socialService.importRecipe(url);
      await createRecipe(recipe);
      Alert.alert('Success', 'Recipe imported successfully!');
      router.push('/recipes');
    } catch (error) {
      Alert.alert('Error', 'Failed to import recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApp = async (platform: 'tiktok' | 'instagram') => {
    try {
      await socialService.openApp(platform);
    } catch (error) {
      Alert.alert('Error', 'Failed to open app. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Import from Social Media</Text>
        <Text style={styles.subtitle}>
          Import recipes from TikTok or Instagram
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Import</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.tiktokButton]}
            onPress={() => handleOpenApp('tiktok')}
          >
            <Ionicons name="logo-tiktok" size={24} color="#fff" />
            <Text style={styles.buttonText}>Open TikTok</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.instagramButton]}
            onPress={() => handleOpenApp('instagram')}
          >
            <Ionicons name="logo-instagram" size={24} color="#fff" />
            <Text style={styles.buttonText}>Open Instagram</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual Import</Text>
        <Text style={styles.description}>
          Paste a TikTok or Instagram URL to import a recipe
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.importButton]}
          onPress={handleImport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-download" size={24} color="#fff" />
              <Text style={styles.buttonText}>Import Recipe</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  tiktokButton: {
    flex: 1,
    backgroundColor: '#000',
  },
  instagramButton: {
    flex: 1,
    backgroundColor: '#E4405F',
  },
  importButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
