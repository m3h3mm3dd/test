import { StyleProp, TextStyle, ViewStyle } from 'react-native'

export interface ButtonProps {
  title: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export interface InputProps {
  label?: string
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  secureTextEntry?: boolean
  disabled?: boolean
  error?: string
  style?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
}

export interface AvatarProps {
  imageUrl?: string
  size?: number
}

export interface BadgeProps {
  status: 'online' | 'offline' | 'busy' | 'away'
  size?: number
}

export interface ListItemProps {
  title: string
  subtitle?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onPress?: () => void
}

export interface ModalProps {
  isVisible: boolean
  onClose: () => void
  children: React.ReactNode
}

export interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}
