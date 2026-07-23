import { StateStorage } from 'zustand/middleware';

let storage: any = null;
let isInMemory = false;

try {
  const { createMMKV } = require('react-native-mmkv');
  storage = createMMKV({
    id: 'gymvault-storage',
  });
} catch (e) {
  isInMemory = true;
  console.warn(
    'react-native-mmkv failed to initialize (running in Expo Go?). Falling back to in-memory storage.'
  );
}

const memoryStore = new Map<string, string>();

export const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    if (isInMemory || !storage) {
      memoryStore.set(name, value);
    } else {
      try {
        storage.set(name, value);
      } catch (e) {
        memoryStore.set(name, value);
      }
    }
  },
  getItem: (name) => {
    if (isInMemory || !storage) {
      return memoryStore.get(name) ?? null;
    }
    try {
      const value = storage.getString(name);
      return value ?? null;
    } catch (e) {
      return memoryStore.get(name) ?? null;
    }
  },
  removeItem: (name) => {
    if (isInMemory || !storage) {
      memoryStore.delete(name);
    } else {
      try {
        storage.remove(name);
      } catch (e) {
        memoryStore.delete(name);
      }
    }
  },
};
