import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Camera, ImagePlus, Loader } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { aiService } from '../../services/ai';
import { router } from 'expo-router';

export default function ScanScreen() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        handleImage(result.assets[0].uri);
      }
    } catch (err) {
      setError('Failed to pick image');
    }
  };

  const handleImage = async (imageUri: string) => {
    setScanning(true);
    setError(null);
    try {
      const recipeData = await aiService.parseRecipeFromImage(imageUri);
      // Navigate to recipe creation with parsed data
      router.push({
        pathname: '/recipes/create',
        params: {
          data: JSON.stringify(recipeData)
        }
      });
    } catch (err) {
      setError('Failed to scan recipe');
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Recipe</Text>
        <Text style={styles.subtitle}>Upload a photo of your recipe to add it to your collection</Text>
      </View>

      <View style={styles.uploadArea}>
        <Pressable style={styles.uploadButton} onPress={pickImage}>
          <ImagePlus size={48} color="#FF6B6B" />
          <Text style={styles.uploadText}>Upload Recipe Photo</Text>
          <Text style={styles.uploadHint}>Tap to select from your photos</Text>
        </Pressable>

        {Platform.OS !== 'web' && (
          <Pressable style={styles.cameraButton}>
            <Camera size={48} color="#FF6B6B" />
            <Text style={styles.uploadText}>Take Photo</Text>
            <Text style={styles.uploadHint}>Use your camera to capture a recipe</Text>
          </Pressable>
        )}
      </View>

      {scanning && (
        <View style={styles.loadingContainer}>
          <Loader size={24} color="#FF6B6B" />
          <Text style={styles.loadingText}>Scanning recipe...</Text>
        </View>
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips for best results:</Text>
        <Text style={styles.tipText}>• Ensure good lighting</Text>
        <Text style={styles.tipText}>• Keep the image clear and focused</Text>
        <Text style={styles.tipText}>• Include all ingredients and instructions</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#64748B',
  },
  uploadArea: {
    padding: 24,
    gap: 16,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  cameraButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  uploadText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 4,
  },
  uploadHint: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  loadingText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#1E293B',
  },
  errorText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    padding: 16,
  },
  tipsContainer: {
    padding: 24,
  },
  tipsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 12,
  },
  tipText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
});