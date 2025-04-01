import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';
import { onboardingService } from '@/services/onboarding';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const ONBOARDING_SCREENS = [
  {
    title: 'Welcome to Chefing',
    description:
      'Your personal AI-powered cooking companion that helps you create amazing meals',
    icon: 'food-variant' as IconName,
  },
  {
    title: 'Chefing AI Assistant',
    description:
      'Tell Chefing what ingredients you have, and it will create personalized recipes just for you',
    icon: 'chef-hat' as IconName,
  },
  {
    title: 'Level Up Your Cooking',
    description:
      'Earn achievements, unlock new recipes, and become a master chef',
    icon: 'trophy' as IconName,
  },
  {
    title: 'Join the Chefing Community',
    description:
      'Share your creations, discover new recipes, and connect with fellow food lovers',
    icon: 'account-group' as IconName,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const isComplete = await onboardingService.isOnboardingComplete();
    if (isComplete) {
      router.replace('/(tabs)');
    }
  };

  const handleComplete = async () => {
    await onboardingService.markOnboardingComplete();
    router.replace('/(tabs)');
  };

  const renderItem = ({ item }: { item: (typeof ONBOARDING_SCREENS)[0] }) => (
    <View style={styles.screen}>
      <MaterialCommunityIcons
        name={item.icon}
        size={120}
        color="#6200ee"
        style={styles.icon}
      />
      <Text variant="headlineMedium" style={styles.title}>
        {item.title}
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        {item.description}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Carousel
        width={width}
        height={width * 1.2}
        data={ONBOARDING_SCREENS}
        renderItem={renderItem}
        onProgressChange={(offset: number, absoluteProgress: number) => {
          setCurrentIndex(Math.round(absoluteProgress));
        }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        loop={false}
        autoPlay={false}
      />
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_SCREENS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
        <Button
          mode="contained"
          onPress={handleComplete}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          {currentIndex === ONBOARDING_SCREENS.length - 1
            ? 'Get Started'
            : 'Skip'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#6200ee',
  },
  button: {
    width: '100%',
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
});
