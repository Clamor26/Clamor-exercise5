import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { ThemeToggle } from '@/components/theme-toggle';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '../contexts/AuthContext';

const setupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  homepageRedirect: z.string().optional(),
});

type SetupForm = z.infer<typeof setupSchema>;

export default function SetupScreen() {
  const { setupAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const inputColors = (hasError?: boolean) => ({
    borderColor: hasError ? '#ff4444' : colorScheme === 'dark' ? '#555' : '#ccc',
    backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f9f9f9',
    color: palette.text,
  });

  const onSubmit = async (data: SetupForm) => {
    setLoading(true);
    try {
      await setupAccount(
        data.firstName,
        data.lastName,
        profilePhoto || undefined,
        data.homepageRedirect || undefined
      );
    } catch (err) {
      Alert.alert('Setup failed', 'Please try again');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.themeCorner, { top: insets.top + 8, right: insets.right + 12 }]}>
        <ThemeToggle />
      </View>
      <Text style={[styles.title, { color: palette.text }]}>Setup Account</Text>
      {profilePhoto ? (
        <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
      ) : (
        <TouchableOpacity
          style={[
            styles.profilePhotoPlaceholder,
            { borderColor: colorScheme === 'dark' ? '#666' : '#ddd' },
          ]}
          onPress={pickImage}>
          <Text style={[styles.placeholderText, { color: palette.icon }]}>Tap to add profile photo</Text>
        </TouchableOpacity>
      )}
      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              style={[styles.input, inputColors(!!errors.firstName)]}
              placeholder="First Name"
              placeholderTextColor={palette.icon}
              value={value}
              onChangeText={onChange}
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName.message}</Text>}
          </>
        )}
      />
      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              style={[styles.input, inputColors(!!errors.lastName)]}
              placeholder="Last Name"
              placeholderTextColor={palette.icon}
              value={value}
              onChangeText={onChange}
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName.message}</Text>}
          </>
        )}
      />
      <Controller
        control={control}
        name="homepageRedirect"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, inputColors()]}
            placeholder="Homepage URL (optional)"
            placeholderTextColor={palette.icon}
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: palette.tint }, loading && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={palette.textOnTint} />
        ) : (
          <Text style={[styles.buttonText, { color: palette.textOnTint }]}>Complete Setup</Text>
        )}
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
    marginBottom: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  profilePhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 12,
    textAlign: 'center',
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
});
