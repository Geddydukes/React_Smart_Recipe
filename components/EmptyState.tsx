import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface Props {
  icon: LucideIcon;
  title: string;
  message: string;
  actionText: string;
  onAction: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionText,
  onAction,
}: Props) {
  return (
    <View style={styles.container}>
      <Icon size={48} color="#64748B" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.button} onPress={onAction}>
        <Text style={styles.buttonText}>{actionText}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
