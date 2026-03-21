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
import { z } from 'zod';
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

  const onSubmit = async (data: SetupForm) => {
    setLoading(true);
    try {
      await setupAccount(data.firstName, data.lastName, profilePhoto || undefined, data.homepageRedirect || undefined);

    } catch (error) {
      Alert.alert('Setup failed', 'Please try again');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setup Account</Text>
      {profilePhoto ? (
        <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
      ) : (
        <TouchableOpacity style={styles.profilePhotoPlaceholder} onPress={pickImage}>
          <Text style={styles.placeholderText}>Tap to add profile photo</Text>
        </TouchableOpacity>
      )}
      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="First Name"
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
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="Last Name"
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
            style={styles.input}
            placeholder="Homepage URL (optional)"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Complete Setup</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
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
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

