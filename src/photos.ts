import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

function extensionFromUri(uri: string): string {
  const match = uri.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1] ?? 'jpg';
}

async function persistPhoto(uri: string): Promise<string> {
  if (Platform.OS === 'web') return uri;

  try {
    const directory = new Directory(Paths.document, 'photos');
    if (!directory.exists) {
      directory.create();
    }

    const filename = `${Date.now().toString(36)}.${extensionFromUri(uri)}`;
    const destination = new File(directory, filename);
    await new File(uri).copy(destination);
    return destination.uri;
  } catch {
    return uri;
  }
}

async function pickAndPersist(
  launcher: () => Promise<ImagePicker.ImagePickerResult>,
): Promise<string | null> {
  const result = await launcher();
  if (result.canceled || !result.assets[0]?.uri) return null;
  return persistPhoto(result.assets[0].uri);
}

export async function takePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  return pickAndPersist(() =>
    ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    }),
  );
}

export async function choosePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  return pickAndPersist(() =>
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    }),
  );
}
