import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hliixatnpxjkhkyoswcw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaWl4YXRucHhqa2hreW9zd2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MzAwOTYsImV4cCI6MjA2ODMwNjA5Nn0.cdtvakmd5huipmZ5vOkDOzcCkI1uUy8P83QHfJNg1y4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (error || !data) {
        console.error('Telegram login error:', error);
        return null;
      }

      // Store the user session
      localStorage.setItem('telegram_id', telegramId.toString());
      return data as AuthUser;
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

  async signUpWithTelegram(userData: {
    phone: string;
    first_name: string;
    last_name: string;
    telegram_username?: string;
    telegram_id?: number;
    role?: 'client' | 'worker' | 'admin';
  }): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          role: userData.role || 'client',
          type: 'telegram'
        }])
        .select()
        .single();

      if (error) {
        console.error('Sign up error:', error);
        return null;
      }

      if (userData.telegram_id) {
        localStorage.setItem('telegram_id', userData.telegram_id.toString());
      }

      return data as AuthUser;
    } catch (error) {
      console.error('Sign up error:', error);
      return null;
    }
  },

  logout() {
    localStorage.removeItem('telegram_id');
  },
};
