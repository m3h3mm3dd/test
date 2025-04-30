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
  Image,
  Dimensions,
  SafeAreaView,
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
  ZoomIn,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import Avatar from '../components/Avatar/Avatar'
import { triggerImpact } from '../utils/HapticUtils'

const { width, height } = Dimensions.get('window')
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

const CURRENT_USER_ID = 'user123'

const ChatScreen = ({ route, navigation }) => {
  const { chatId, chatName, groupChat = false } = route?.params || {}
  const insets = useSafeAreaInsets()
  
  // States
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showAtBottom, setShowAtBottom] = useState(true)
  const [participants, setParticipants] = useState([
    { id: 'user123', name: 'You', avatar: undefined, online: true },
    { id: 'user456', name: 'Alex Taylor', avatar: undefined, online: true },
    { id: 'user789', name: 'Morgan Smith', avatar: undefined, online: false }
  ])
  
  // Refs
  const flatListRef = useRef<FlatList>(null)
  const inputRef = useRef<TextInput>(null)
  
  // Animated Values
  const headerHeight = useSharedValue(64 + insets.top)
  const inputContainerHeight = useSharedValue(60)
  const messageContainerHeight = useSharedValue(height - 150)
  const scrollPosition = useSharedValue(0)
  const keyboardHeight = useSharedValue(0)
  const isKeyboardVisible = useSharedValue(false)
  const isSending = useSharedValue(0)
  const typingIndicatorOpacity = useSharedValue(0)
  const buttonScale = useSharedValue(1)
  
  // Load chat history
  useEffect(() => {
    // Simulated data loading
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
    
    // Simulate typing indicator after a delay
    const typingTimer = setTimeout(() => {
      setIsTyping(true)
      typingIndicatorOpacity.value = withTiming(1, { duration: 300 })
      
      // Hide typing indicator after a few seconds
      setTimeout(() => {
        setIsTyping(false)
        typingIndicatorOpacity.value = withTiming(0, { duration: 300 })
      }, 5000)
    }, 2000)
    
    // Scroll to bottom on initial load
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 500)
    
    return () => clearTimeout(typingTimer)
  }, [])
  
  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      (e) => {
        keyboardHeight.value = e.endCoordinates.height
        isKeyboardVisible.value = true
        messageContainerHeight.value = withTiming(
          height - 150 - e.endCoordinates.height,
          { duration: 200 }
        )
        
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
          height - 150,
          { duration: 200 }
        )
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
        return <Feather name="check" size={14} color={Colors.neutrals.gray500} />
      case 'delivered':
        return <Feather name="check-circle" size={14} color={Colors.neutrals.gray500} />
      case 'read':
        return <Feather name="check-circle" size={14} color={Colors.primary.blue} />
      default:
        return null
    }
  }
  
  // Animated styling
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollPosition.value,
      [0, 100],
      [1, 0.95],
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
      shadowOpacity: scrollPosition.value > 20 ? 0.15 : 0
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
      ]
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
        size={32}
        style={styles.messageAvatar}
      />
    ) : (
      <View style={{ width: 32, marginRight: 8 }} />
    )
    
    const AnimationComponent = isCurrentUser ? SlideInRight : SlideInLeft
    
    return (
      <>
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <Text style={styles.timestampText}>
              {new Date(item.timestamp).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
          </View>
        )}
        
        <Animated.View 
          entering={AnimationComponent.delay(index * 50).duration(300)}
          style={[
            styles.messageRow,
            isCurrentUser ? styles.currentUserMessageRow : styles.otherUserMessageRow
          ]}
        >
          {!isCurrentUser && avatarComponent}
          
          <View 
            style={[
              styles.messageBubble,
              isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
            ]}
          >
            {!isCurrentUser && !showAvatar && (
              <View style={styles.spacer} />
            )}
            
            {/* Sender name for group chats */}
            {groupChat && !isCurrentUser && showAvatar && (
              <Text style={styles.senderName}>{item.sender.name}</Text>
            )}
            
            {item.replyTo && (
              <View style={styles.replyContainer}>
                <View style={styles.replyLine} />
                <Text style={styles.replyText} numberOfLines={1}>
                  {item.replyTo.sender.name}: {item.replyTo.text}
                </Text>
              </View>
            )}
            
            <Text style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText
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
                    >
                      <View style={styles.imageAttachmentPlaceholder}>
                        <Feather name="image" size={24} color={Colors.neutrals.gray500} />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      key={`${item.id}-attachment-${i}`}
                      style={styles.fileAttachment}
                      activeOpacity={0.9}
                    >
                      <Feather name="file" size={16} color={Colors.primary.blue} />
                      <Text style={styles.fileAttachmentName} numberOfLines={1}>
                        {attachment.name || 'File'}
                      </Text>
                    </TouchableOpacity>
                  )
                ))}
              </View>
            )}
            
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
      
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Feather name="arrow-left" size={24} color={Colors.neutrals.gray800} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerTitleContainer}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Text style={styles.headerTitle}>{chatName || 'Chat'}</Text>
          {isTyping ? (
            <Animated.View style={typingIndicatorStyle}>
              <Text style={styles.typingText}>typing...</Text>
            </Animated.View>
          ) : (
            <View style={styles.onlineContainer}>
              {participants.filter(p => p.id !== CURRENT_USER_ID).slice(0, 3).map((participant, index) => (
                <View 
                  key={participant.id}
                  style={[
                    styles.onlineIndicator,
                    { backgroundColor: participant.online ? Colors.status.success : Colors.neutrals.gray400 }
                  ]}
                />
              ))}
              <Text style={styles.participantsText}>
                {groupChat 
                  ? `${participants.length} members` 
                  : participants.find(p => p.id !== CURRENT_USER_ID)?.online 
                    ? 'online' 
                    : 'offline'
                }
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Feather name="phone" size={20} color={Colors.primary.blue} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Feather name="more-vertical" size={20} color={Colors.neutrals.gray700} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Messages Container */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidView}
      >
        <Animated.View style={[styles.messagesContainer, messageContainerStyle]}>
          <AnimatedFlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
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
              <View style={styles.typingBubble}>
                <View style={styles.typingDot} />
                <Animated.View 
                  style={[styles.typingDot, { marginLeft: 3 }]}
                  entering={FadeIn.duration(400).delay(200)}
                  exiting={FadeOut.duration(300)}
                />
                <Animated.View 
                  style={[styles.typingDot, { marginLeft: 3 }]}
                  entering={FadeIn.duration(400).delay(400)}
                  exiting={FadeOut.duration(300)}
                />
              </View>
            </Animated.View>
          )}
          
          {/* Scroll to bottom button */}
          {!showAtBottom && (
            <TouchableOpacity 
              style={styles.scrollToBottomButton}
              onPress={scrollToBottom}
            >
              <Feather name="chevron-down" size={20} color={Colors.neutrals.white} />
            </TouchableOpacity>
          )}
        </Animated.View>
        
        {/* Input area */}
        <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Feather name="plus" size={24} color={Colors.primary.blue} />
          </TouchableOpacity>
          
          <View style={styles.textInputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.neutrals.gray500}
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
                  colors={[Colors.primary.blue, Colors.primary.darkBlue]}
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
              style={styles.micButton}
              onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Feather name="mic" size={22} color={Colors.neutrals.gray700} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200,
    backgroundColor: Colors.background.light,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12
  },
  backButton: {
    padding: 8
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8
  },
  headerTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900
  },
  typingText: {
    fontSize: Typography.sizes.caption,
    color: Colors.primary.blue,
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
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerButton: {
    padding: 8,
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
    paddingTop: 16,
    paddingBottom: 16
  },
  timestampContainer: {
    alignItems: 'center',
    marginVertical: 16
  },
  timestampText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    backgroundColor: 'rgba(240, 242, 245, 0.8)',
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
    backgroundColor: Colors.neutrals.gray200,
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
    color: Colors.neutrals.gray900
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6
  },
  messageTime: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray500,
    marginRight: 4,
    opacity: 0.8
  },
  spacer: {
    height: 8
  },
  senderName: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary.blue,
    marginBottom: 4
  },
  replyContainer: {
    paddingLeft: 8,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 255, 255, 0.5)'
  },
  replyLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.neutrals.gray400
  },
  replyText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
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
    backgroundColor: Colors.neutrals.gray300,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8
  },
  fileAttachmentName: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray800,
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
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.neutrals.gray600
  },
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.light,
    borderTopWidth: 1,
    borderTopColor: Colors.neutrals.gray200
  },
  attachButton: {
    padding: 8,
    marginRight: 8
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: Colors.neutrals.gray100,
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
    backgroundColor: Colors.neutrals.gray100,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default ChatScreen