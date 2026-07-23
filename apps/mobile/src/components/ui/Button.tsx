import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: any;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const theme = useTheme();

  const getStyles = (pressed: boolean) => {
    const baseStyle: any[] = [styles.button, styles[size]];
    
    // Background and border colors
    if (variant === 'primary') {
      baseStyle.push({
        backgroundColor: theme.primary,
        opacity: disabled || isLoading ? 0.6 : pressed ? 0.9 : 1,
      });
    } else if (variant === 'secondary') {
      baseStyle.push({
        backgroundColor: theme.backgroundSelected,
        opacity: disabled || isLoading ? 0.6 : pressed ? 0.9 : 1,
      });
    } else if (variant === 'outline') {
      baseStyle.push({
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.textSecondary,
        opacity: disabled || isLoading ? 0.6 : pressed ? 0.9 : 1,
      });
    } else if (variant === 'danger') {
      baseStyle.push({
        backgroundColor: '#ff453a',
        opacity: disabled || isLoading ? 0.6 : pressed ? 0.9 : 1,
      });
    }

    return [baseStyle, style];
  };

  const getTextColor = () => {
    if (variant === 'primary') {
      // In dark mode, primaryText is #000000. In light mode, primaryText is #ffffff.
      return 'primaryText' in theme ? theme.primaryText : '#ffffff';
    }
    if (variant === 'danger') {
      return '#ffffff';
    }
    return theme.text;
  };

  const textColor = getTextColor();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => getStyles(pressed)}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { color: textColor },
              size === 'small' && styles.textSmall,
              size === 'large' && styles.textLarge,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: Spacing.two,
  },
  small: {
    height: 38,
    paddingHorizontal: Spacing.three,
  },
  medium: {
    height: 50,
    paddingHorizontal: Spacing.four,
  },
  large: {
    height: 56,
    paddingHorizontal: Spacing.five,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 18,
  },
});
