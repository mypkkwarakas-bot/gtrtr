import { Redirect } from 'expo-router';
import { useAuth } from '../src/auth';

/** Pintu masuk tunggal: arahkan sesuai peran dari sesi (admin / kepala) atau ke login. */
export default function Index() {
  const { status } = useAuth();
  if (status === 'admin') return <Redirect href="/admin" />;
  if (status === 'kepala') return <Redirect href="/kepala" />;
  return <Redirect href="/login" />;
}
