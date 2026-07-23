import { Platform } from 'react-native';

// Standard local API endpoint definitions.
// Note: On Android emulator, 10.0.2.2 connects to host.
// On iOS simulator, localhost/127.0.0.1 connects to host.
// Since you are running on a physical Android device, we use the local IP (192.168.1.210).
export const API_URL = Platform.select({
  web: 'http://localhost:3000',
  default: 'http://192.168.1.210:3000',
});
