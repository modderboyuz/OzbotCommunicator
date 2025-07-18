import * as React from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { MessageCircle, ExternalLink } from "lucide-react";
import { authService, type AuthUser } from "@/lib/auth.js";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: AuthUser) => void;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loginStep, setLoginStep] = React.useState<'initial' | 'waiting' | 'checking'>('initial');
  const [loginData, setLoginData] = React.useState<{ token: string; client_id: string } | null>(null);
  const { toast } = useToast();

  const handleTelegramLogin = async () => {
    setIsLoading(true);
<<<<<<< HEAD
<<<<<<< HEAD
    setLoginStep('initial');
    
    try {
      const result = await authService.startTelegramLogin();
      
      if (!result) {
        toast({
          title: "Xatolik",
          description: "Login jarayonini boshlashda xatolik",
          variant: "destructive",
        });
        return;
      }

      setLoginData(result);
      setLoginStep('waiting');
      
      // Open Telegram bot
      window.open(result.bot_url, '_blank');
      
      // Start checking for token verification
      startTokenCheck(result.token);
      
    } catch (error) {
      console.error('Telegram login error:', error);
      toast({
        title: "Xatolik",
        description: "Login jarayonida xatolik yuz berdi",
        variant: "destructive",
      });
=======
=======
>>>>>>> parent of d5f8a26 (Saved your changes before starting work)
    
    try {
      // In a real implementation, this would redirect to Telegram bot
      // For now, we'll simulate the flow
      
      // Open Telegram bot link
      const botUsername = "metalbaza_bot"; // Replace with actual bot username
      const telegramUrl = `https://t.me/${botUsername}?start=login`;
      
      // Open in new window/tab
      window.open(telegramUrl, '_blank');
      
      // Show instructions to user
      alert("Telegram botga o'ting va /start buyrug'ini bosing, so'ngra ro'yxatdan o'tish jarayonini boshlang.");
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Telegram login error:', error);
<<<<<<< HEAD
>>>>>>> parent of d5f8a26 (Saved your changes before starting work)
=======
>>>>>>> parent of d5f8a26 (Saved your changes before starting work)
    } finally {
      setIsLoading(false);
    }
  };

  const startTokenCheck = (token: string) => {
    setLoginStep('checking');
    
    const checkInterval = setInterval(async () => {
      try {
        const user = await authService.verifyToken(token);
        
        if (user) {
          clearInterval(checkInterval);
          onLogin(user);
          onClose();
          setLoginStep('initial');
          toast({
            title: "Muvaffaqiyat",
            description: "Telegram orqali muvaffaqiyatli kirildi!",
          });
        }
      } catch (error) {
        // Token not ready yet, continue checking
      }
    }, 2000);

    // Stop checking after 5 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
      if (loginStep === 'checking') {
        setLoginStep('initial');
        toast({
          title: "Vaqt tugadi",
          description: "Login jarayoni vaqti tugadi. Qaytadan urinib ko'ring.",
          variant: "destructive",
        });
      }
    }, 5 * 60 * 1000);
  };

  const handleRetry = () => {
    setLoginStep('initial');
    setLoginData(null);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Kirish">
      <div className="space-y-6">
<<<<<<< HEAD
        {loginStep === 'initial' && (
          <>
            <div className="text-center">
              <p className="text-gray-600">
                Buyurtma berish va profil boshqarish uchun
              </p>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={handleTelegramLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 bg-black hover:bg-gray-800 text-white py-3 rounded-xl"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Telegram orqali kirish</span>
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Telegram botimizga o'tib, login jarayonini yakunlang
                </p>
              </div>
            </div>
          </>
        )}

        {loginStep === 'waiting' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Telegram botga o'ting</h3>
              <p className="text-gray-600 mb-4">
                Telegram botda "Ruxsat berish" tugmasini bosing
              </p>
              {loginData && (
                <Button
                  variant="outline"
                  onClick={() => window.open(loginData.bot_url, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Botni qayta ochish
                </Button>
              )}
            </div>
            <Button variant="ghost" onClick={handleRetry}>
              Bekor qilish
            </Button>
=======
        <div className="text-center">
          <p className="text-gray-600">
            Buyurtma berish va profil boshqarish uchun
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={handleTelegramLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 bg-black hover:bg-gray-800 text-white py-3 rounded-xl"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Telegram orqali kirish</span>
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Telegram botimizga o'tib, /start buyrug'ini bosing
            </p>
>>>>>>> parent of d5f8a26 (Saved your changes before starting work)
          </div>
        )}

        {loginStep === 'checking' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Tekshirilmoqda...</h3>
              <p className="text-gray-600">
                Telegram botdagi tasdiqlash kutilmoqda
              </p>
            </div>
            <Button variant="ghost" onClick={handleRetry}>
              Bekor qilish
            </Button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}