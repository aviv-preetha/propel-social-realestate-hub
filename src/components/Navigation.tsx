
import React, { useState } from 'react';
import { Home, Users, Building, User, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">PropelMau</h1>
          </div>
          
          <div className="flex space-x-1 relative">
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
