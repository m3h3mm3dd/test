import React, { useState, useEffect, useRef } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  Dimensions,
  StatusBar,
  Keyboard
} from 'react-native'
import { BlurView } from 'expo-blur'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideInLeft,
  interpolate,
  Extrapolation,
  Layout
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'

// Import components from our codebase
import Avatar from '../components/Avatar/Avatar'
import StatusBadge from '../components/Badge/StatusBadge'
import FAB from '../components/FAB'
import SkeletonLoader from '../components/Skeleton/SkeletonLoader'

// Import themes and utilities
import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import { useTheme } from '../hooks/useColorScheme'
import { triggerImpact } from '../utils/HapticUtils'
import { timeAgo } from '../utils/helpers'

const { width } = Dimensions.get('window')
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

// Message Types
interface Message {
  id: string
  text: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
  attachments?: {
    type: 'image' | 'file'
    url: string
    thumbnailUrl?: string
    name?: string
    size?: number
  }[]
  reactions?: {
    type: string
    count: number
    users: string[]
  }[]
  replyTo?: {
    id: string
    text: string
    sender: {
      id: string
      name: string
    }
  }
}

interface Participant {
  id: string
  name: string
  avatar?: string
  online: boolean
  lastActive?: string
}

const CURRENT_USER_ID = 'user123'

const ChatScreen = () => {
  const { colors, isDark } = useTheme()
  const navigation = useNavigation()
  const route = useRoute()
  const { chatId, chatName, groupChat = false } = route?.params || {}
  const insets = useSafeAreaInsets()
  
  // States
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showAtBottom, setShowAtBottom] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'user123', name: 'You', avatar: undefined, online: true },
    { id: 'user456', name: 'Alex Taylor', avatar: undefined, online: true, lastActive: new Date().toISOString() },
    { id: 'user789', name: 'Morgan Smith', avatar: undefined, online: false, lastActive: new Date(Date.now() - 3600000).toISOString() }
  ])
  
  // Refs
  const flatListRef = useRef<FlatList>(null)
  const inputRef = useRef<TextInput>(null)
  
  // Animated Values
  const headerHeight = useSharedValue(64 + insets.top)
  const inputContainerHeight = useSharedValue(60)
  const messageContainerHeight = useSharedValue(Dimensions.get('window').height - 150)
  const scrollPosition = useSharedValue(0)
  const keyboardHeight = useSharedValue(0)
  const isKeyboardVisible = useSharedValue(false)
  const isSending = useSharedValue(0)
  const typingIndicatorOpacity = useSharedValue(0)
  const buttonScale = useSharedValue(1)
  const fabOpacity = useSharedValue(1)
  
  // Get other participant(s) for display
  const otherParticipants = participants.filter(p => p.id !== CURRENT_USER_ID)
  const otherParticipantName = otherParticipants[0]?.name || 'Chat'
  
  // Load chat history
  useEffect(() => {
    // Simulated data loading
    setTimeout(() => {
      const mockMessages: Message[] = [
        {
          id: '1',
          text: 'Hey there! How's the new design coming along?',
          sender: { id: 'user456', name: 'Alex Taylor' },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'read'
        },
        {
          id: '2',
          text: 'I've just finished the dashboard wireframes. Looking for your feedback!',
          sender: { id: 'user123', name: 'You' },
          timestamp: new Date(Date.now() - 3400000).toISOString(),
          status: 'read',
          attachments: [
            { type: 'image', url: 'https://example.com/wireframe.jpg', thumbnailUrl: 'https://example.com/wireframe_thumb.jpg' }
          ]
        },
        {
          id: '3',
          text: 'They look great! Just a few tweaks needed on the header navigation.',
          sender: { id: 'user456', name: 'Alex Taylor' },
          timestamp: new Date(Date.now() - 3200000).toISOString(),
          status: 'read'
        },
        {
          id: '4',
          text: 'Can you explain what specifically needs adjustment?',
          sender: { id: 'user123', name: 'You' },
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          status: 'read'
        },
        {
          id: '5',
          text: 'The spacing between elements feels a bit tight. Maybe increase padding by 8px?',
          sender: { id: 'user456', name: 'Alex Taylor' },
          timestamp: new Date(Date.now() - 2800000).toISOString(),
          status: 'read'
        },
        {
          id: '6',
          text: 'I think we should also consider adding a dropdown menu for additional actions.',
          sender: { id: 'user789', name: 'Morgan Smith' },
          timestamp: new Date(Date.now() - 2600000).toISOString(),
          status: 'read'
        },
        {
          id: '7',
          text: 'Good point! I'll update the wireframes with these changes.',
          sender: { id: 'user123', name: 'You' },
          timestamp: new Date(Date.now() - 2400000).toISOString(),
          status: 'read'
        },
        {
          id: '8',
          text: 'Great! Looking forward to the next iteration.',
          sender: { id: 'user456', name: 'Alex Taylor' },
          timestamp: new Date(Date.now() - 2200000).toISOString(),
          status: 'read'
        }
      ]
      
      setMessages(mockMessages)
      setIsLoading(false)
      
      // Simulate typing indicator after a delay
      const typingTimer = setTimeout(() => {
        setIsTyping(true)
        typingIndicatorOpacity.value = withTiming(1, { duration: 300 })
        
        // Hide typing indicator after a few seconds
        setTimeout(() => {
          setIsTyping(false)
          typingIndicatorOpacity.value = withTiming(0, { duration: 300 })
        }, 5000)
      }, 1500)
      
      // Scroll to bottom on initial load
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 300)
      
      return () => clearTimeout(typingTimer)
    }, 800)
  }, [])
  
  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      (e) => {
        keyboardHeight.value = e.endCoordinates.height
        isKeyboardVisible.value = true
        messageContainerHeight.value = withTiming(
          Dimensions.get('window').height - 150 - e.endCoordinates.height,
          { duration: 200 }
        )
        fabOpacity.value = withTiming(0, { duration: 200 })
        
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 100)
      }
    )
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => {
        keyboardHeight.value = 0
        isKeyboardVisible.value = false
        messageContainerHeight.value = withTiming(
          Dimensions.get('window').height - 150,
          { duration: 200 }
        )
        fabOpacity.value = withTiming(1, { duration: 200 })
      }
    )
    
    return () => {
      keyboardWillShowListener.remove()
      keyboardWillHideListener.remove()
    }
  }, [])
  
  const handleBackPress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }
  
  const handleSend = () => {
    if (!inputText.trim()) return
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    
    // Animate send button
    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 100 })
    )
    
    isSending.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 300 })
    )
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: { id: CURRENT_USER_ID, name: 'You' },
      timestamp: new Date().toISOString(),
      status: 'sent'
    }
    
    setMessages(prev => [...prev, newMessage])
    setInputText('')
    
    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
    
    // Simulate message delivered status update
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' } 
            : msg
        )
      )
      
      // Then simulate read status
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'read' } 
              : msg
          )
        )
      }, 2000)
    }, 1000)
    
    // Simulate typing response after some time
    setTimeout(() => {
      setIsTyping(true)
      typingIndicatorOpacity.value = withTiming(1, { duration: 300 })
      
      // Simulate a response message
      setTimeout(() => {
        setIsTyping(false)
        typingIndicatorOpacity.value = withTiming(0, { duration: 300 })
        
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Thanks for the update! Looking forward to seeing the changes.',
          sender: { id: 'user456', name: 'Alex Taylor' },
          timestamp: new Date().toISOString(),
          status: 'read'
        }
        
        setMessages(prev => [...prev, responseMessage])
        
        // Scroll to bottom after receiving
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 100)
      }, 3000)
    }, 1500)
  }
  
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y
    scrollPosition.value = offsetY
    
    // Show/hide scroll to bottom button based on distance from bottom
    const layoutMeasurement = event.nativeEvent.layoutMeasurement
    const contentSize = event.nativeEvent.contentSize
    const isCloseToBottom = layoutMeasurement.height + offsetY >= contentSize.height - 20
    
    setShowAtBottom(isCloseToBottom)
  }
  
  const scrollToBottom = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    flatListRef.current?.scrollToEnd({ animated: true })
  }
  
  // Format time from ISO string
  const formatMessageTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Render message status icon
  const renderMessageStatus = (status) => {
    switch (status) {
      case 'sent':
        return <Feather name="check" size={14} color={isDark ? colors.neutrals[500] : Colors.neutrals[500]} />
      case 'delivered':
        return <Feather name="check-circle" size={14} color={isDark ? colors.neutrals[500] : Colors.neutrals[500]} />
      case 'read':
        return <Feather name="check-circle" size={14} color={colors.primary[500]} />
      default:
        return null
    }
  }
  
  // Animated styling
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollPosition.value,
      [0, 100],
      [1, 0.98],
      Extrapolation.CLAMP
    )
    
    const elevation = interpolate(
      scrollPosition.value,
      [0, 50],
      [0, 8],
      Extrapolation.CLAMP
    )
    
    return {
      opacity,
      elevation,
      shadowOpacity: scrollPosition.value > 20 ? 0.15 : 0,
      backgroundColor: isDark 
        ? colors.card.background
        : Colors.background.light,
      borderBottomColor: isDark 
        ? colors.border
        : Colors.neutrals[200]
    }
  })
  
  const messageContainerStyle = useAnimatedStyle(() => {
    return {
      height: messageContainerHeight.value
    }
  })
  
  const inputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(
            isSending.value,
            [0, 1],
            [0, -5],
            Extrapolation.CLAMP
          )
        }
      ],
      backgroundColor: isDark 
        ? colors.card.background
        : Colors.background.light,
      borderTopColor: isDark 
        ? colors.border
        : Colors.neutrals[200]
    }
  })
  
  const typingIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: typingIndicatorOpacity.value
    }
  })
  
  const sendButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    }
  })
  
  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fabOpacity.value,
      transform: [
        { scale: fabOpacity.value },
        { translateY: interpolate(
            fabOpacity.value,
            [0, 1],
            [20, 0],
            Extrapolation.CLAMP
          )}
      ]
    }
  })
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <View style={[
        styles.container, 
        { backgroundColor: isDark ? colors.background.dark : Colors.background.light }
      ]}>
        <StatusBar 
          barStyle={isDark ? "light-content" : "dark-content"} 
          backgroundColor="transparent" 
          translucent 
        />
        
        <Animated.View 
          style={[
            styles.header, 
            { paddingTop: insets.top, height: 60 + insets.top },
            headerAnimatedStyle
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Feather 
              name="arrow-left" 
              size={24} 
              color={isDark ? colors.text.primary : Colors.neutrals[800]} 
            />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <SkeletonLoader width={120} height={20} />
            <SkeletonLoader width={80} height={14} style={{ marginTop: 4 }} />
          </View>
          
          <View style={styles.headerActions}>
            <SkeletonLoader width={36} height={36} borderRadius={18} style={{ marginRight: 8 }} />
            <SkeletonLoader width={36} height={36} borderRadius={18} />
          </View>
        </Animated.View>
        
        <View style={[styles.loadingContainer, { marginTop: 60 + insets.top }]}>
          {[1, 2, 3, 4, 5].map(i => (
            <View key={i} style={styles.loadingMessageRow}>
              {i % 2 === 0 ? (
                <>
                  <View style={{ flex: 1 }} />
                  <SkeletonLoader
                    width={width * 0.7}
                    height={60}
                    borderRadius={18}
                    style={{ borderBottomRightRadius: 4 }}
                  />
                </>
              ) : (
                <>
                  <SkeletonLoader
                    width={36}
                    height={36}
                    borderRadius={18}
                    style={{ marginRight: 8 }}
                  />
                  <SkeletonLoader
                    width={width * 0.7}
                    height={60}
                    borderRadius={18}
                    style={{ borderBottomLeftRadius: 4 }}
                  />
                  <View style={{ flex: 1 }} />
                </>
              )}
            </View>
          ))}
        </View>
        
        <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
          <SkeletonLoader width={40} height={40} borderRadius={20} style={{ marginRight: 8 }} />
          <SkeletonLoader 
            width={width - 130} 
            height={44} 
            borderRadius={22} 
          />
          <SkeletonLoader width={40} height={40} borderRadius={20} style={{ marginLeft: 8 }} />
        </Animated.View>
      </View>
    )
  }
  
  const renderMessage = ({ item, index }) => {
    const isCurrentUser = item.sender.id === CURRENT_USER_ID
    const showAvatar = !isCurrentUser && 
      (index === 0 || messages[index - 1].sender.id !== item.sender.id)
    const showTimestamp = index === 0 || 
      new Date(item.timestamp).getDate() !== new Date(messages[index - 1].timestamp).getDate()
    
    const avatarComponent = showAvatar ? (
      <Avatar 
        name={item.sender.name}
        imageUrl={item.sender.avatar}
        size={36}
        style={styles.messageAvatar}
        status={
          otherParticipants.find(p => p.id === item.sender.id)?.online 
            ? 'online' 
            : 'offline'
        }
      />
    ) : (
      <View style={{ width: 36, marginRight: 8 }} />
    )
    
    const AnimationComponent = isCurrentUser ? SlideInRight : SlideInLeft
    
    return (
      <>
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <Text style={[
              styles.timestampText, 
              { backgroundColor: isDark ? 'rgba(40, 40, 40, 0.8)' : 'rgba(240, 242, 245, 0.8)' }
            ]}>
              {new Date(item.timestamp).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
          </View>
        )}
        
        <Animated.View 
          entering={AnimationComponent.delay(index * 50).duration(300)}
          layout={Layout.springify().damping(14)}
          style={[
            styles.messageRow,
            isCurrentUser ? styles.currentUserMessageRow : styles.otherUserMessageRow
          ]}
        >
          {!isCurrentUser && avatarComponent}
          
          <View 
            style={[
              styles.messageBubble,
              isCurrentUser 
                ? [
                    styles.currentUserBubble, 
                    { backgroundColor: colors.primary[isDark ? 700 : 500] }
                  ] 
                : [
                    styles.otherUserBubble, 
                    { 
                      backgroundColor: isDark 
                        ? 'rgba(60, 60, 70, 0.8)' 
                        : Colors.neutrals[200]
                    }
                  ]
            ]}
          >
            {!isCurrentUser && !showAvatar && (
              <View style={styles.spacer} />
            )}
            
            {/* Sender name for group chats */}
            {groupChat && !isCurrentUser && showAvatar && (
              <Text style={[
                styles.senderName, 
                { color: colors.primary[500] }
              ]}>
                {item.sender.name}
              </Text>
            )}
            
            {item.replyTo && (
              <View style={[
                styles.replyContainer,
                { 
                  borderLeftColor: isDark 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : isCurrentUser 
                      ? 'rgba(255, 255, 255, 0.5)' 
                      : 'rgba(0, 0, 0, 0.2)' 
                }
              ]}>
                <Text style={[
                  styles.replyText,
                  { 
                    color: isCurrentUser 
                      ? 'rgba(255, 255, 255, 0.8)' 
                      : isDark 
                        ? colors.text.secondary 
                        : Colors.neutrals[600] 
                  }
                ]} numberOfLines={1}>
                  {item.replyTo.sender.name}: {item.replyTo.text}
                </Text>
              </View>
            )}
            
            <Text style={[
              styles.messageText,
              isCurrentUser 
                ? styles.currentUserText 
                : [
                    styles.otherUserText,
                    { color: isDark ? colors.text.primary : Colors.neutrals[900] }
                  ]
            ]}>
              {item.text}
            </Text>
            
            {item.attachments && item.attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                {item.attachments.map((attachment, i) => (
                  attachment.type === 'image' ? (
                    <TouchableOpacity 
                      key={`${item.id}-attachment-${i}`}
                      style={styles.imageAttachment}
                      activeOpacity={0.9}
                      onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <View style={[
                        styles.imageAttachmentPlaceholder,
                        { backgroundColor: isDark ? colors.neutrals[800] : Colors.neutrals[300] }
                      ]}>
                        <Feather 
                          name="image" 
                          size={24} 
                          color={isDark ? colors.neutrals[400] : Colors.neutrals[500]} 
                        />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      key={`${item.id}-attachment-${i}`}
                      style={[
                        styles.fileAttachment,
                        { 
                          backgroundColor: isCurrentUser 
                            ? 'rgba(255, 255, 255, 0.15)' 
                            : isDark 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(0, 0, 0, 0.05)' 
                        }
                      ]}
                      activeOpacity={0.9}
                      onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <Feather name="file" size={16} color={colors.primary[500]} />
                      <Text style={[
                        styles.fileAttachmentName,
                        { 
                          color: isCurrentUser 
                            ? Colors.neutrals.white 
                            : isDark 
                              ? colors.text.primary 
                              : Colors.neutrals[800] 
                        }
                      ]} numberOfLines={1}>
                        {attachment.name || 'File'}
                      </Text>
                    </TouchableOpacity>
                  )
                ))}
              </View>
            )}
            
            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                { 
                  color: isCurrentUser 
                    ? 'rgba(255, 255, 255, 0.7)' 
                    : isDark 
                      ? colors.text.secondary 
                      : Colors.neutrals[500]
                }
              ]}>
                {formatMessageTime(item.timestamp)}
              </Text>
              
              {isCurrentUser && renderMessageStatus(item.status)}
            </View>
          </View>
        </Animated.View>
      </>
    )
  }
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDark ? colors.background.dark : Colors.background.light }
    ]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent 
      />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { paddingTop: insets.top, height: 60 + insets.top },
          headerAnimatedStyle
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Feather 
            name="arrow-left" 
            size={24} 
            color={isDark ? colors.text.primary : Colors.neutrals[800]} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerTitleContainer}
          activeOpacity={0.7}
          onPress={() => {
            triggerImpact(Haptics.ImpactFeedbackStyle.Light)
            navigation.navigate('ProfileScreen')
          }}
        >
          <Text style={[
            styles.headerTitle,
            { color: isDark ? colors.text.primary : Colors.neutrals[900] }
          ]}>
            {chatName || otherParticipantName}
          </Text>
          
          {isTyping ? (
            <Animated.View style={typingIndicatorStyle}>
              <Text style={[
                styles.typingText,
                { color: colors.primary[500] }
              ]}>
                typing...
              </Text>
            </Animated.View>
          ) : (
            <View style={styles.onlineContainer}>
              {otherParticipants.slice(0, 3).map((participant, index) => (
                <View 
                  key={participant.id}
                  style={[
                    styles.onlineIndicator,
                    { 
                      backgroundColor: participant.online 
                        ? colors.success[500] 
                        : isDark 
                          ? colors.neutrals[600] 
                          : Colors.neutrals[400] 
                    }
                  ]}
                />
              ))}
              <Text style={[
                styles.participantsText,
                { color: isDark ? colors.text.secondary : Colors.neutrals[600] }
              ]}>
                {groupChat 
                  ? `${participants.length} members` 
                  : otherParticipants[0]?.online 
                    ? 'online' 
                    : otherParticipants[0]?.lastActive
                      ? `seen ${timeAgo(otherParticipants[0]?.lastActive)}` 
                      : 'offline'
                }
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[
              styles.headerButton,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(61, 90, 254, 0.08)' }
            ]}
            onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Feather 
              name="phone" 
              size={20} 
              color={colors.primary[500]} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.headerButton,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }
            ]}
            onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Feather 
              name="more-vertical" 
              size={20} 
              color={isDark ? colors.text.secondary : Colors.neutrals[700]} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Messages Container */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Animated.View style={[
          styles.messagesContainer, 
          messageContainerStyle
        ]}>
          <AnimatedFlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.messagesList, 
              { paddingBottom: insets.bottom + 16 }
            ]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            inverted={false}
          />
          
          {/* Typing Indicator at bottom */}
          {isTyping && (
            <Animated.View 
              style={[styles.typingIndicatorContainer, typingIndicatorStyle]}
            >
              <View style={[
                styles.typingBubble,
                { 
                  backgroundColor: isDark 
                    ? 'rgba(60, 60, 70, 0.8)' 
                    : Colors.neutrals[200]
                }
              ]}>
                <View style={[
                  styles.typingDot,
                  { backgroundColor: isDark ? colors.neutrals[400] : Colors.neutrals[600] }
                ]} />
                <Animated.View 
                  style={[
                    styles.typingDot, 
                    { 
                      marginLeft: 3,
                      backgroundColor: isDark ? colors.neutrals[400] : Colors.neutrals[600]
                    }
                  ]}
                  entering={FadeIn.duration(400).delay(200)}
                  exiting={FadeOut.duration(300)}
                />
                <Animated.View 
                  style={[
                    styles.typingDot, 
                    { 
                      marginLeft: 3,
                      backgroundColor: isDark ? colors.neutrals[400] : Colors.neutrals[600]
                    }
                  ]}
                  entering={FadeIn.duration(400).delay(400)}
                  exiting={FadeOut.duration(300)}
                />
              </View>
            </Animated.View>
          )}
          
          {/* Scroll to bottom button */}
          {!showAtBottom && (
            <Animated.View style={fabAnimatedStyle}>
              <FAB 
                icon="chevron-down" 
                size="small"
                style={styles.scrollToBottomButton}
                onPress={scrollToBottom}
                gradientColors={[colors.primary[500], colors.primary[700]]}
              />
            </Animated.View>
          )}
        </Animated.View>
        
        {/* Input area */}
        <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
          <TouchableOpacity 
            style={[
              styles.attachButton,
              { 
                backgroundColor: isDark 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(61, 90, 254, 0.08)' 
              }
            ]}
            onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Feather name="plus" size={24} color={colors.primary[500]} />
          </TouchableOpacity>
          
          <View style={[
            styles.textInputContainer,
            { 
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.06)' 
                : Colors.neutrals[100]
            }
          ]}>
            <TextInput
              ref={inputRef}
              style={[
                styles.textInput,
                { color: isDark ? colors.text.primary : Colors.neutrals[900] }
              ]}
              placeholder="Type a message..."
              placeholderTextColor={isDark ? colors.text.disabled : Colors.neutrals[500]}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxHeight={120}
            />
          </View>
          
          {inputText.trim() ? (
            <Animated.View style={sendButtonStyle}>
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSend}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[colors.primary[500], colors.primary[700]]}
                  style={styles.sendButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Feather name="send" size={18} color={Colors.neutrals.white} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity 
              style={[
                styles.micButton,
                { 
                  backgroundColor: isDark 
                    ? 'rgba(255, 255, 255, 0.06)' 
                    : Colors.neutrals[100] 
                }
              ]}
              onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Feather 
                name="mic" 
                size={22} 
                color={isDark ? colors.text.secondary : Colors.neutrals[700]} 
              />
            </TouchableOpacity>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    zIndex: 10
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8
  },
  headerTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold
  },
  typingText: {
    fontSize: Typography.sizes.caption,
    fontStyle: 'italic'
  },
  onlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 3
  },
  participantsText: {
    fontSize: Typography.sizes.caption
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  keyboardAvoidView: {
    flex: 1
  },
  messagesContainer: {
    flex: 1
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16
  },
  timestampContainer: {
    alignItems: 'center',
    marginVertical: 16
  },
  timestampText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals[600],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16
  },
  currentUserMessageRow: {
    justifyContent: 'flex-end'
  },
  otherUserMessageRow: {
    justifyContent: 'flex-start'
  },
  messageAvatar: {
    marginRight: 8,
    alignSelf: 'flex-end'
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18
  },
  currentUserBubble: {
    backgroundColor: Colors.primary.blue,
    borderBottomRightRadius: 4
  },
  otherUserBubble: {
    backgroundColor: Colors.neutrals[200],
    borderBottomLeftRadius: 4
  },
  messageText: {
    fontSize: Typography.sizes.body,
    lineHeight: 20
  },
  currentUserText: {
    color: Colors.neutrals.white
  },
  otherUserText: {
    color: Colors.neutrals[900]
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6
  },
  messageTime: {
    fontSize: Typography.sizes.caption,
    marginRight: 4,
    opacity: 0.8
  },
  spacer: {
    height: 8
  },
  senderName: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    marginBottom: 4
  },
  replyContainer: {
    paddingLeft: 8,
    marginBottom: 8,
    borderLeftWidth: 2
  },
  replyText: {
    fontSize: Typography.sizes.caption,
    paddingBottom: 4
  },
  attachmentsContainer: {
    marginTop: 8
  },
  imageAttachment: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden'
  },
  imageAttachmentPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8
  },
  fileAttachmentName: {
    fontSize: Typography.sizes.caption,
    marginLeft: 8
  },
  typingIndicatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 60,
    zIndex: 10
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 16,
    right: 16
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  textInput: {
    fontSize: Typography.sizes.body,
    maxHeight: 100,
    padding: 0
  },
  sendButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  micButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainer: {
    flex: 1,
    padding: 16
  },
  loadingMessageRow: {
    flexDirection: 'row',
    marginBottom: 16
  }
})

export default ChatScreen