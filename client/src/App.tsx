import { Switch, Route } from "wouter";
import { queryClient } from "./lib/query-client.js";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/hooks/use-auth.tsx";
import { useBottomNav } from "@/hooks/use-bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Navigation } from "@/components/layout/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { CartBar } from "@/components/layout/cart-bar";
import Home from "@/pages/home";
import Catalog from "@/pages/catalog";
import Workers from "@/pages/workers";
import Orders from "@/pages/orders";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import AdminHome from "@/pages/admin-home";
import Checkout from "@/pages/checkout";
import WorkerApplications from "@/pages/worker-applications";
import NotFound from "@/pages/not-found";

function Router() {
  const { isVisible } = useBottomNav();
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  const handleCartOrder = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pb-20 md:pb-0">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/catalog" component={Catalog} />
          <Route path="/workers" component={Workers} />
          <Route path="/orders" component={Orders} />
          <Route path="/worker-applications" component={user?.role === 'worker' ? WorkerApplications : NotFound} />
          <Route path="/profile" component={Profile} />
          <Route path="/checkout" component={Checkout} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {isVisible && <BottomNavigation />}
      <CartBar onOrderClick={handleCartOrder} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="metalbaza-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
