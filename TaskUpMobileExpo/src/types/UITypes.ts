
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

// Button component props
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorScheme?: string;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isFullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  withHapticFeedback?: boolean;
}

// Input component props
export interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  type?: 'text' | 'password' | 'email' | 'number' | 'phone';
  variant?: 'outline' | 'filled' | 'flushed' | 'unstyled';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  error?: string;
  helper?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  maxLength?: number;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

// Avatar component props
export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circle' | 'square' | 'rounded';
  status?: 'online' | 'offline' | 'busy' | 'away';
  showBadge?: boolean;
  badgeProps?: BadgeProps;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// Badge component props
export interface BadgeProps {
  status?: 'online' | 'offline' | 'busy' | 'away';
  variant?: 'solid' | 'subtle' | 'outline';
  colorScheme?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  label?: string;
  style?: StyleProp<ViewStyle>;
}

// List item component props
export interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  avatar?: Omit<AvatarProps, 'size'>;
  onPress?: () => void;
  isDisabled?: boolean;
  divider?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Modal component props
export interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  closeOnOverlayClick?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
  footer?: ReactNode;
  closeButton?: boolean;
  backdropBlur?: boolean;
  position?: 'center' | 'top' | 'bottom';
  slideFrom?: 'bottom' | 'top' | 'left' | 'right';
  animationDuration?: number;
}

// Toast component props
export interface ToastProps {
  message: string;
  title?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  position?: 'top' | 'bottom';
  showProgress?: boolean;
  onClose?: () => void;
  variant?: 'solid' | 'subtle' | 'left-accent' | 'top-accent';
  isClosable?: boolean;
}

// Card component props
export interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  elevation?: 0 | 1 | 2 | 3 | 4;
  variant?: 'elevated' | 'outline' | 'filled' | 'unstyled';
  colorScheme?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// Alert component props
export interface AlertProps {
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  variant?: 'solid' | 'subtle' | 'left-accent' | 'top-accent';
  isOpen?: boolean;
  onClose?: () => void;
  icon?: ReactNode;
  closable?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Progress indicator props
export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorScheme?: string;
  isIndeterminate?: boolean;
  hasStripe?: boolean;
  isAnimated?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

// Tab component props
export interface TabProps {
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

// TabView component props
export interface TabViewProps {
  tabs: TabProps[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  variant?: 'line' | 'enclosed' | 'enclosed-colored' | 'soft-rounded' | 'solid-rounded';
  orientation?: 'horizontal' | 'vertical';
  isFitted?: boolean;
  colorScheme?: string;
  style?: StyleProp<ViewStyle>;
}

// CheckBox component props
export interface CheckboxProps {
  label?: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

// RadioButton component props
export interface RadioProps {
  label?: string;
  value: string;
  isChecked: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

// RadioGroup component props
export interface RadioGroupProps {
  name: string;
  options: Array<{ label: string; value: string; disabled?: boolean }>;
  value: string;
  onChange: (value: string) => void;
  direction?: 'row' | 'column';
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
  style?: StyleProp<ViewStyle>;
}

// Switch component props
export interface SwitchProps {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

// Text component props
export interface TextProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'button' | 'overline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'thin' | 'extralight' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'uppercase' | 'lowercase' | 'capitalize';
  decoration?: 'none' | 'underline' | 'line-through';
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}

// Icon props
export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

// Image props
export interface ImageProps {
  source: { uri: string } | number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  borderRadius?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  fallback?: ReactNode;
  alt?: string;
}