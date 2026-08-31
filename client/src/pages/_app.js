import '../styles/globals.css';
import { useEffect } from 'react';
import Head from 'next/head';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function MyApp({ Component, pageProps }) {
  const initAuth = useAuthStore((state) => state.initAuth);
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initAuth();
    initTheme();
  }, [initAuth, initTheme]);

  return (
    <>
      <Head>
        <title>MailPilot AI - Intelligent Email Assistant</title>
        <meta name="description" content="Next-generation AI-powered email management and copilot connected with Gmail OAuth." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
