import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTutorialContext } from '@/contexts/TutorialContext';

const { width } = Dimensions.get('window');

export function RecipeTutorial() {
  const { showTutorial, completeTutorial, skipTutorial } = useTutorialContext();

  if (!showTutorial) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="book-open-variant"
          size={48}
          color="#007AFF"
          style={styles.icon}
        />
        <Text variant="headlineSmall" style={styles.title}>
          Find Your Recipe
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          Browse through our collection of recipes or use AI to generate one
          that matches your preferences.
        </Text>
        <Text variant="bodyMedium" style={styles.instruction}>
          1. Browse through recipes or use AI to generate one{'\n'}
          2. Select a recipe you'd like to try{'\n'}
          3. Add it to your shopping list
        </Text>
        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={skipTutorial} style={styles.button}>
            Skip
          </Button>
          <Button
            mode="contained"
            onPress={completeTutorial}
            style={styles.button}
          >
            Complete
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  instruction: {
    textAlign: 'left',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginHorizontal: 8,
    minWidth: 100,
  },
});
