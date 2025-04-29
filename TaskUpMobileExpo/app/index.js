import { Redirect } from 'expo-router';

// This file is here to satisfy Expo Router, but we're using React Navigation
// This redirects any attempts to use Expo Router to our main app
export default function Page() {
  return <Redirect href="/" />;
}