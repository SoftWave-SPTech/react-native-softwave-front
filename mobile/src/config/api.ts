import { Platform } from 'react-native';

const WEB_API_BASE_URL = 'http://localhost:8084';
const ANDROID_API_BASE_URL = 'http://10.0.2.2:8084';
const IOS_API_BASE_URL = 'http://localhost:8084';

function resolveDefaultBaseUrl() {
  if (Platform.OS === 'android') {
    return ANDROID_API_BASE_URL;
  }

  if (Platform.OS === 'ios') {
    return IOS_API_BASE_URL;
  }

  return WEB_API_BASE_URL;
}

export const API_BASE_URL = resolveDefaultBaseUrl();
