import { useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    chat_instance?: string;
    chat_type?: string;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initTelegram = () => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        setWebApp(tg);
        
        console.log('Telegram Web App SDK yuklandi:', {
          initData: tg.initData,
          user: tg.initDataUnsafe?.user,
          platform: tg.platform,
          version: tg.version
        });
        
        // Get user data from initDataUnsafe
        if (tg.initDataUnsafe?.user) {
          setUser(tg.initDataUnsafe.user);
          console.log('Telegram foydalanuvchisi topildi:', tg.initDataUnsafe.user);
        }

        // Let Telegram know we're ready
        tg.ready();
        setIsReady(true);

        // Expand the app to full height
        tg.expand();
        
        // Force iOS black/white theme
        try {
          // Apply CSS custom properties for consistent styling
          document.documentElement.style.setProperty('--tg-bg-color', '#ffffff');
          document.documentElement.style.setProperty('--tg-text-color', '#000000');
          document.documentElement.style.setProperty('--tg-hint-color', '#666666');
          document.documentElement.style.setProperty('--tg-button-color', '#000000');
          document.documentElement.style.setProperty('--tg-button-text-color', '#ffffff');
          document.documentElement.style.setProperty('--tg-secondary-bg-color', '#f5f5f5');
        } catch (e) {
          console.log('Telegram tema sozlamalari qo\'llanmadi:', e);
        }
      }
    };

    // Check if Telegram SDK is already loaded
    if (window.Telegram?.WebApp) {
      initTelegram();
    } else {
      // Wait for SDK to load
      const checkTelegram = setInterval(() => {
        if (window.Telegram?.WebApp) {
          clearInterval(checkTelegram);
          initTelegram();
        }
      }, 100);
      
      // Clear interval after 5 seconds
      setTimeout(() => clearInterval(checkTelegram), 5000);
    }
  }, []);

  const isTelegramWebApp = () => {
    return !!window.Telegram?.WebApp?.initData;
  };

  return {
    webApp,
    user,
    isReady,
    isTelegramWebApp: isTelegramWebApp(),
  };
}
