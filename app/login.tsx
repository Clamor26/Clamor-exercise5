import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { ThemeToggle } from '@/components/theme-toggle';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch {
      Alert.alert('Login failed', 'Please try again');
    } finally {
      setLoading(false);
    }
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
              value={value}
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
              value={value}
              onChangeText={onChange}
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </>
        )}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: palette.tint }, loading && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={palette.textOnTint} />
        ) : (
          <Text style={[styles.buttonText, { color: palette.textOnTint }]}>Login</Text>
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
  link: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
  },
});
