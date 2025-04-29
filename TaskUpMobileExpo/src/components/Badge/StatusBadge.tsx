import React from 'react'
import { StyleSheet, View } from 'react-native'
import { BadgeProps } from '../../types/UITypes'
import Colors from '../../theme/Colors'

const StatusBadge = ({ status, size = 10 }: BadgeProps) => {
  const getBadgeColor = () => {
    switch (status) {
      case 'online':
        return Colors.secondary.green
      case 'busy':
        return Colors.error
      case 'away':
        return Colors.warning
      case 'offline':
      default:
        return Colors.neutrals.gray400
    }
  }

  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: getBadgeColor() }
      ]}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={`Status: ${status}`}
    />
  )
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1.5,
    borderColor: Colors.neutrals.white
  }
})

export default StatusBadge