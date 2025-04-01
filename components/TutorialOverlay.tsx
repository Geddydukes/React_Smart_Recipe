import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface TutorialOverlayProps {
  visible: boolean;
  onDismiss: () => void;
  onComplete: () => void;
  step: 'recipe' | 'shopping' | 'cooking' | 'tracking';
  title: string;
  description: string;
  targetElement?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export function TutorialOverlay({
  visible,
  onDismiss,
  onComplete,
  step,
  title,
  description,
  targetElement,
}: TutorialOverlayProps) {
  const renderHighlight = () => {
    if (!targetElement) return null;

    return (
      <View
        style={[
          styles.highlight,
          {
            top: targetElement.y,
            left: targetElement.x,
            width: targetElement.width,
            height: targetElement.height,
          },
        ]}
      />
    );
  };

  const renderContent = () => {
    switch (step) {
      case 'recipe':
        return (
          <View style={styles.content}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={48}
              color="#007AFF"
            />
            <Text variant="headlineSmall" style={styles.title}>
              {title}
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {description}
            </Text>
            <Text variant="bodyMedium" style={styles.instruction}>
              1. Browse through recipes or use AI to generate one{'\n'}
              2. Select a recipe you'd like to try{'\n'}
              3. Add it to your shopping list
            </Text>
          </View>
        );
      case 'shopping':
        return (
          <View style={styles.content}>
            <MaterialCommunityIcons name="cart" size={48} color="#007AFF" />
            <Text variant="headlineSmall" style={styles.title}>
              {title}
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {description}
            </Text>
            <Text variant="bodyMedium" style={styles.instruction}>
              1. Review your shopping list{'\n'}
              2. Mark items you already have{'\n'}
              3. Add any additional items you need
            </Text>
          </View>
        );
      case 'cooking':
        return (
          <View style={styles.content}>
            <MaterialCommunityIcons name="chef-hat" size={48} color="#007AFF" />
            <Text variant="headlineSmall" style={styles.title}>
              {title}
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {description}
            </Text>
            <Text variant="bodyMedium" style={styles.instruction}>
              1. Follow the step-by-step instructions{'\n'}
              2. Use the timer for precise cooking{'\n'}
              3. Mark the recipe as complete when done
            </Text>
          </View>
        );
      case 'tracking':
        return (
          <View style={styles.content}>
            <MaterialCommunityIcons name="camera" size={48} color="#007AFF" />
            <Text variant="headlineSmall" style={styles.title}>
              {title}
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {description}
            </Text>
            <Text variant="bodyMedium" style={styles.instruction}>
              1. Take a photo of your creation{'\n'}
              2. Track the calories{'\n'}
              3. Share your success with the community
            </Text>
          </View>
        );
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.container}>
          {renderHighlight()}
          <View style={styles.overlay}>
            {renderContent()}
            <View style={styles.buttonContainer}>
              <Button mode="outlined" onPress={onDismiss} style={styles.button}>
                Skip
              </Button>
              <Button
                mode="contained"
                onPress={onComplete}
                style={styles.button}
              >
                Complete
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  highlight: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    alignItems: 'center',
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
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
