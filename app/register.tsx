import { router } from 'expo-router';
import React from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeToggle } from '@/components/theme-toggle';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '../contexts/AuthContext';

type RegisterForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

const inputStyle = (palette: (typeof Colors)['light'], scheme: 'light' | 'dark', hasError?: boolean) => [
  styles.input,
  {
    borderColor: hasError ? '#ff4444' : scheme === 'dark' ? '#555' : '#ccc',
    backgroundColor: scheme === 'dark' ? '#2a2a2a' : '#f9f9f9',
    color: palette.text,
  },
];

export default function RegisterScreen() {
  const { register, registerWithGoogle } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    const email = data.email.trim();
    const password = data.password.trim();
    const confirmPassword = data.confirmPassword.trim();

    if (!email || !password || !confirmPassword) {
      Alert.alert('Missing information', 'Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
    } catch {
      Alert.alert('Registration failed', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (_errors: FieldErrors<RegisterForm>) => {
    // Keep invalid form submissions from bubbling as uncaught errors in RN web.
  };

  const handleRegisterPress = () => {
    void handleSubmit(onSubmit, onInvalid)();
  };

  const handleGoogleRegister = async () => {
    if (Platform.OS === 'web') {
      setGoogleLoading(true);
      try {
        await registerWithGoogle();
        router.replace('/setup');
      } catch {
        Alert.alert('Google sign-up failed', 'Please check Firebase Google sign-in settings and try again.');
      } finally {
        setGoogleLoading(false);
      }
      return;
    }

    Alert.alert('Google sign-up unavailable', 'Google sign-up on mobile is disabled in Expo Go. Use web for now.');
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.themeCorner, { top: insets.top + 8, right: insets.right + 12 }]}>
        <ThemeToggle />
      </View>
      <Text style={[styles.title, { color: palette.text }]}>Register</Text>
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
              style={inputStyle(palette, colorScheme, !!errors.email)}
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
              style={inputStyle(palette, colorScheme, !!errors.password)}
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
      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          required: 'Confirm password is required',
          validate: (value) => value === passwordValue || "Passwords don't match",
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              style={inputStyle(palette, colorScheme, !!errors.confirmPassword)}
              placeholder="Confirm Password"
              placeholderTextColor={palette.icon}
              value={value ?? ''}
              onChangeText={onChange}
              secureTextEntry
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
            )}
          </>
        )}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: palette.tint }, loading && styles.buttonDisabled]}
        onPress={handleRegisterPress}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={palette.textOnTint} />
        ) : (
          <Text style={[styles.buttonText, { color: palette.textOnTint }]}>Register</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          styles.googleButton,
          { borderColor: colorScheme === 'dark' ? '#666' : '#d0d0d0' },
          googleLoading && styles.buttonDisabled,
        ]}
        onPress={() => void handleGoogleRegister()}
        disabled={googleLoading}>
        {googleLoading ? (
          <ActivityIndicator color={palette.text} />
        ) : (
          <Text style={[styles.googleButtonText, { color: palette.text }]}>Continue with Google</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => router.push('/login')}>
        <Text style={[styles.linkText, { color: palette.tint }]}>Already have an account? Login</Text>
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
