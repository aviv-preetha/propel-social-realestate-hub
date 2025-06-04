
import React, { useState } from 'react';
import { Home, Users, Building, User, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import NotificationsDropdown from './NotificationsDropdown';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { signOut } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'properties', label: 'Properties', icon: Building },
  ];

  const handleSignOut = async () => {
    await signOut();
    setShowProfileDropdown(false);
  };

  const handleProfileClick = (tab: string) => {
    if (tab === 'profile') {
      setShowProfileDropdown(!showProfileDropdown);
    } else {
      setShowProfileDropdown(false);
      onTabChange(tab);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-20 h-10 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 91.7 32" xmlns="http://www.w3.org/2000/svg" class="css-1qno6kt"><title>SeLoger Homepage</title><path d="m58.121 28c4.102 0 6.737-1.62 7.813-6.29l2.812-12.109h-3.925l-.293 1.271c-.624-.899-1.718-1.62-3.436-1.62-4.432 0-7.286 3.459-7.421 7.342-.117 3.631 2.402 5.586 5.195 5.586 1.681 0 2.715-.661 3.436-1.601l-.354 1.504c-.428 1.857-1.583 2.928-3.435 2.928-1.29 0-1.877-.526-1.974-2.09l-3.827.74c-.019 2.868 2.048 4.334 5.409 4.334m-58.121-11.555c.507 3.827 3.319 6.308 7.966 6.308 4.646 0 6.779-2.677 6.779-5.801s-1.779-4.688-5.764-5.526c-3.222-.684-3.985-1.345-3.985-2.323 0-1.034.838-1.699 2.36-1.699 2.048 0 3.008 1.191 3.264 2.286h4.18c-.875-4.125-3.785-5.685-7.36-5.685-3.925 0-6.504 2.09-6.504 5.172 0 3.083 2.048 4.763 5.684 5.466 2.696.508 3.986 1.173 3.986 2.598 0 1.057-.978 1.858-2.635 1.858-2.538 0-3.516-1.425-3.73-2.659h-4.241zm15.21-.452c0 4.023 3.087 6.756 6.565 6.756 3.221 0 5.721-1.388 6.601-4.707h-3.887c-.293.898-1.076 1.56-2.519 1.56-1.583 0-2.891-.936-3.105-2.561h9.511c.079-.428.159-.978.159-1.406 0-3.552-2.519-6.388-6.486-6.388-3.924 0-6.834 2.733-6.834 6.737m3.71-1.345c.354-1.504 1.523-2.342 3.124-2.342 1.602 0 2.542.74 2.812 2.342zm8.986 7.751h10.075l.88-3.789h-5.862l3.264-14.256h-4.218zm11.034-5.465c-.117 3.3 2.658 5.819 6.131 5.819 4.763 0 8.143-3.124 8.301-7.44.14-3.887-2.518-6.052-6.21-6.052-4.824 0-8.064 3.338-8.222 7.673m4.064-.587c.061-1.737 1.388-3.436 3.515-3.436 1.737 0 2.849 1.034 2.794 2.677-.061 2.072-1.639 3.515-3.613 3.515-1.364 0-2.752-.978-2.696-2.756m14.61-.14c.06-1.76 1.289-3.496 3.436-3.496 1.308 0 2.402.861 2.341 2.384-.079 2.029-1.503 3.631-3.319 3.631-1.308 0-2.519-.801-2.463-2.519m14.023-1.559c.545-1.523 2.011-2.342 3.575-2.342 1.858 0 2.873.684 2.812 2.342zm-4.004 2.109c-.116 3.575 2.17 5.996 5.764 5.996 3.142 0 5.489-1.131 6.834-3.887l-3.478-.685c-.33.685-1.406 1.425-2.83 1.425-1.639 0-2.519-.899-2.561-2.561h9.586c.312-.861.526-1.895.526-2.891 0-2.812-2.262-4.902-5.996-4.902-4.609 0-7.715 3.557-7.85 7.5m12.599 5.643h3.924l1.327-5.801c.545-2.384 1.858-3.692 3.711-3.692.409 0 .661.06.996.158l1.485-3.631c-.33-.117-.703-.177-1.154-.177-1.583 0-3.008.74-3.925 2.286l.47-1.933h-3.906z" fill="#E30513"></path></svg>
            </div>            
          </div>
          
          <div className="flex items-center justify-center flex-1">
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleProfileClick(item.id)}
                    className={`flex flex-col items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Notifications dropdown */}
            <NotificationsDropdown />
            
            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => handleProfileClick('profile')}
                className={`flex flex-col items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <User className="h-5 w-5 mb-1" />
                  <ChevronDown className="h-3 w-3 ml-1 mb-1" />
                </div>
                <span>Profile</span>
              </button>
              
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onTabChange('profile');
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
