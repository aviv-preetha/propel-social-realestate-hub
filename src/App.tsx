
import { Suspense, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./components/Auth";
import Navigation from "./components/Navigation";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import Network from "./components/Network";
import Properties from "./components/Properties";
import ShortlistsManager from "./components/ShortlistsManager";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <Auth />
        <Toaster />
      </QueryClientProvider>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Feed />;
      case 'network':
        return <Network />;
      case 'properties':
        return <Properties />;
      case 'shortlists':
        return <ShortlistsManager />;
      case 'profile':
        return <Profile />;
      default:
        return <Feed />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="pt-20 pb-8 px-4">
          <Suspense fallback={<div className="flex items-center justify-center h-32">Loading...</div>}>
            {renderContent()}
          </Suspense>
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
};

export default App;
