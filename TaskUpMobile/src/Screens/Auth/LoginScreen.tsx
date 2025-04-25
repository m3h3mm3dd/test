import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  useAnimatedStyle, 
  useSharedValue, 
  withSpring
} from 'react-native-reanimated';
import { useAuth } from '../../Hooks/UseAuth';
import { useTheme } from '../../Hooks/UseTheme';
import { Button } from '../../Components/UI/Button';
import { Text } from '../../Components/UI/Text';
import { InputField } from '../../Components/Forms/InputField';
import { Checkbox } from '../../Components/UI/Checkbox';
import Toast from 'react-native-toast-message';

export const LoginScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(1);

  const handleLoginPress = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter both email and password',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (!result.success) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: result.error,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoPress = () => {
    logoScale.value = withSpring(logoScale.value === 1 ? 1.1 : 1);
  };

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleLogoPress}
          style={styles.logoContainer}
        >
          <Animated.Image
            source={require('../../Assets/Images/AppLogo.png')}
            style={[styles.logo, logoAnimatedStyle]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Animated.View 
          style={styles.headerContainer}
          entering={FadeInDown.delay(300).duration(700)}
        >
          <Text 
            style={[styles.title, { color: theme.colors.text }]}
            variant="h1"
          >
            Welcome back
          </Text>
          <Text 
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            variant="body"
          >
            Sign in to continue to TaskUp
          </Text>
        </Animated.View>

        <Animated.View 
          style={styles.formContainer}
          entering={FadeInUp.delay(400).duration(700)}
        >
          <InputField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="lock-closed-outline"
          />

          <View style={styles.optionsRow}>
            <Checkbox
              label="Remember me"
              checked={rememberMe}
              onToggle={() => setRememberMe(!rememberMe)}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text 
                style={{ color: theme.colors.primary }}
                variant="button"
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Sign In"
            onPress={handleLoginPress}
            loading={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <Text style={{ color: theme.colors.textSecondary }}>
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              style={styles.signupButton}
            >
              <Text 
                style={{ color: theme.colors.primary }}
                variant="button"
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginTop: 40,
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
    marginTop: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  loginButton: {
    marginTop: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  signupButton: {
    marginLeft: 4,
  },
});