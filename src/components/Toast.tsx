import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, useColorScheme, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useToast } from '../context/ToastContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');

export const Toast: React.FC = () => {
  const { toast, visible, hideToast } = useToast();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(50, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(-100, { duration: 300, easing: Easing.out(Easing.exp) });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  if (!toast) return null;

  const getIcon = () => {
    const size = 20;
    const color = isDark ? colors.white : colors.dark.text;
    
    switch (toast.type) {
      case 'success': return <CheckCircle size={size} color={colors.accent} />;
      case 'error': return <AlertCircle size={size} color="#FF5252" />;
      default: return <Info size={size} color={isDark ? colors.accent : colors.dark.accent} />;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={isDark ? 30 : 50} tint={isDark ? 'dark' : 'light'} style={styles.blur}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>{getIcon()}</View>
            <Text style={[styles.text, { color: isDark ? colors.white : colors.dark.text }]} numberOfLines={2}>
              {toast.message}
            </Text>
          </View>
        </BlurView>
      ) : (
        <View style={[styles.blur, { backgroundColor: isDark ? 'rgba(30, 27, 24, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderBottomWidth: 1, borderBottomColor: themeColors.border }]}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>{getIcon()}</View>
            <Text style={[styles.text, { color: isDark ? colors.white : colors.dark.text }]} numberOfLines={2}>
              {toast.message}
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  blur: {
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  text: {
    flex: 1,
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
  },
});
