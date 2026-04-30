import { router } from 'expo-router';
import React from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeToggle } from '@/components/theme-toggle';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '../contexts/AuthContext';

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const { login, loginWithGoogle } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    const email = data.email.trim();
    const password = data.password.trim();

    if (!email || !password) {
      Alert.alert('Missing information', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch {
      Alert.alert('Login failed', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (_errors: FieldErrors<LoginForm>) => {
    // Keep invalid form submissions from bubbling as uncaught errors in RN web.
  };

  const handleLoginPress = () => {
    void handleSubmit(onSubmit, onInvalid)();
  };

  const handleGoogleLogin = async () => {
    if (Platform.OS === 'web') {
      setGoogleLoading(true);
      try {
        await loginWithGoogle();
      } catch {
        Alert.alert('Google sign-in failed', 'Please check Firebase Google sign-in settings and try again.');
      } finally {
        setGoogleLoading(false);
      }
      return;
    }

    Alert.alert('Google sign-in unavailable', 'Google sign-in on mobile is disabled in Expo Go. Use web for now.');
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.themeCorner, { top: insets.top + 8, right: insets.right + 12 }]}>
        <ThemeToggle />
      </View>
      <Text style={[styles.title, { color: palette.text }]}>Login</Text>
      <Controller
        control={control}
        name="email"
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email',
          },
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colorScheme === 'dark' ? '#555' : '#ccc',
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f9f9f9',
                  color: palette.text,
                },
                errors.email && styles.inputError,
              ]}
              placeholder="Email"
              placeholderTextColor={palette.icon}
              value={value ?? ''}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </>
        )}
      />
      <Controller
        control={control}
        name="password"
        rules={{
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colorScheme === 'dark' ? '#555' : '#ccc',
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f9f9f9',
                  color: palette.text,
                },
                errors.password && styles.inputError,
              ]}
              placeholder="Password"
              placeholderTextColor={palette.icon}
              value={value ?? ''}
              onChangeText={onChange}
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </>
        )}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: palette.tint }, loading && styles.buttonDisabled]}
        onPress={handleLoginPress}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={palette.textOnTint} />
        ) : (
          <Text style={[styles.buttonText, { color: palette.textOnTint }]}>Login</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          styles.googleButton,
          { borderColor: colorScheme === 'dark' ? '#666' : '#d0d0d0' },
          googleLoading && styles.buttonDisabled,
        ]}
        onPress={() => void handleGoogleLogin()}
        disabled={googleLoading}>
        {googleLoading ? (
          <ActivityIndicator color={palette.text} />
        ) : (
          <Text style={[styles.googleButtonText, { color: palette.text }]}>Continue with Google</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => router.push('/register')}>
        <Text style={[styles.linkText, { color: palette.tint }]}>{"Don't have an account? Register"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  themeCorner: {
    position: 'absolute',
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff6666',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    marginTop: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
  },
});
