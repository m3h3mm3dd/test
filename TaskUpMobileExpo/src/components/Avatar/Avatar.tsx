import React from 'react'
import { StyleSheet, Image, View } from 'react-native'
import { AvatarProps } from '../../types/UITypes'
import Colors from '../../theme/Colors'

const Avatar = ({ imageUrl, size = 40 }: AvatarProps) => {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel="User profile image"
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  placeholder: {
    backgroundColor: Colors.neutrals.gray300
  }
})

export default Avatar