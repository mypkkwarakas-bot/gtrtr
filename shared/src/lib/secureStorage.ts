import * as SecureStore from 'expo-secure-store';

/**
 * Penyimpanan sesi Supabase yang terenkripsi (Android Keystore melalui expo-secure-store).
 * SecureStore membatasi ukuran nilai (~2 KB), sedangkan JSON sesi Supabase lebih besar,
 * sehingga nilai dipecah menjadi beberapa potongan. Operasi diserialkan agar pembacaan
 * tidak pernah melihat potongan yang setengah tertulis.
 */
const CHUNK_SIZE = 1800;

let queue: Promise<unknown> = Promise.resolve();
function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

const countKey = (key: string) => `${key}__n`;
const partKey = (key: string, i: number) => `${key}__${i}`;

async function readCount(key: string): Promise<number> {
  const raw = await SecureStore.getItemAsync(countKey(key));
  if (raw === null) return 0;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export const secureStorage = {
  getItem(key: string): Promise<string | null> {
    return serialize(async () => {
      const count = await readCount(key);
      if (count === 0) return null;
      let out = '';
      for (let i = 0; i < count; i += 1) {
        const part = await SecureStore.getItemAsync(partKey(key, i));
        if (part === null) return null;
        out += part;
      }
      return out;
    });
  },

  setItem(key: string, value: string): Promise<void> {
    return serialize(async () => {
      const previous = await readCount(key);
      const parts: string[] = [];
      for (let i = 0; i < value.length; i += CHUNK_SIZE) parts.push(value.slice(i, i + CHUNK_SIZE));
      for (let i = 0; i < parts.length; i += 1) {
        await SecureStore.setItemAsync(partKey(key, i), parts[i]);
      }
      await SecureStore.setItemAsync(countKey(key), String(parts.length));
      for (let i = parts.length; i < previous; i += 1) {
        await SecureStore.deleteItemAsync(partKey(key, i));
      }
    });
  },

  removeItem(key: string): Promise<void> {
    return serialize(async () => {
      const count = await readCount(key);
      for (let i = 0; i < count; i += 1) await SecureStore.deleteItemAsync(partKey(key, i));
      await SecureStore.deleteItemAsync(countKey(key));
    });
  },
};
