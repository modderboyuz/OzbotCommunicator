export interface AuthUser {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  telegram_username?: string;
  telegram_id?: number;
  role: 'client' | 'worker' | 'admin';
  type: 'telegram' | 'google';
  created_at: string;
  updated_at: string;
}

export const authService = {
  async loginWithTelegram(telegramId: number): Promise<AuthUser | null> {
    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegram_id: telegramId }),
      });

      if (!response.ok) {
        return null;
      }

      const { user } = await response.json();
      localStorage.setItem('telegram_id', telegramId.toString());
      return user as AuthUser;
    } catch (error) {
      console.error('Telegram login error:', error);
      return null;
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const telegramId = localStorage.getItem('telegram_id');
    if (!telegramId) return null;

    return await this.loginWithTelegram(Number(telegramId));
  },

  async startTelegramLogin(): Promise<{ bot_url: string; token: string; client_id: string } | null> {
    try {
      const telegramId = localStorage.getItem('telegram_id');
      if (!telegramId) {
        // Generate a temporary ID for new users
        const tempId = Date.now();
        localStorage.setItem('temp_telegram_id', tempId.toString());
      }

      const response = await fetch(`/api/auth/telegram-login?telegram_id=${telegramId || Date.now()}`);
      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Start Telegram login error:', error);
      return null;
    }
  },

  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        return null;
      }

      const { user } = await response.json();
      localStorage.setItem('telegram_id', user.telegram_id.toString());
      return user as AuthUser;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  },

  logout() {
    localStorage.removeItem('telegram_id');
    localStorage.removeItem('temp_telegram_id');
  },
};