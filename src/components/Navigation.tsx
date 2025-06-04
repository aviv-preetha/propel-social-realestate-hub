
import React, { useState } from 'react';
import { Rss, Users, Building, User, ChevronDown, LogOut } from 'lucide-react';
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
    { id: 'properties', label: 'Properties', icon: Building },
    { id: 'home', label: 'Feed', icon: Rss },
    { id: 'network', label: 'Network', icon: Users },
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
            <svg width="100" height="32" viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
              <path d="M11.8433 13.9354C11.5402 13.3585 11.1016 12.9218 10.5274 12.6252C9.9691 12.312 9.30715 12.1555 8.54152 12.1555C7.21763 12.1555 6.15692 12.6087 5.35939 13.5151C4.56186 14.405 4.1631 15.5999 4.1631 17.0996C4.1631 18.6982 4.57781 19.9507 5.40724 20.8572C6.25262 21.7471 7.40903 22.1921 8.87649 22.1921C9.88137 22.1921 10.7268 21.9284 11.4126 21.401C12.1145 20.8736 12.6249 20.1155 12.9439 19.1267H7.75197V16.0119H16.6524V19.9425C16.3493 20.9972 15.8309 21.9778 15.0972 22.8843C14.3794 23.7907 13.4623 24.5241 12.3457 25.0844C11.2292 25.6447 9.9691 25.9249 8.56545 25.9249C6.90659 25.9249 5.42319 25.5541 4.11524 24.8125C2.82325 24.0544 1.81039 23.0079 1.07666 21.6729C0.358888 20.338 0 18.8136 0 17.0996C0 15.3856 0.358888 13.8612 1.07666 12.5263C1.81039 11.1749 2.82325 10.1284 4.11524 9.38674C5.40724 8.62864 6.88267 8.24959 8.54152 8.24959C10.5513 8.24959 12.2421 8.75224 13.6138 9.75755C15.0015 10.7629 15.9187 12.1555 16.3653 13.9354H11.8433Z" fill="black"/>
              <path d="M31.5036 18.6817C31.5036 19.0773 31.4797 19.4893 31.4318 19.9178H22.1725C22.2363 20.7748 22.4995 21.434 22.9621 21.8954C23.4406 22.3404 24.0228 22.5629 24.7087 22.5629C25.7295 22.5629 26.4393 22.1179 26.8381 21.228H31.1926C30.9693 22.1344 30.5625 22.9502 29.9724 23.6753C29.3981 24.4005 28.6724 24.969 27.7951 25.3811C26.9178 25.7931 25.9369 25.9991 24.8522 25.9991C23.5443 25.9991 22.3799 25.7107 21.359 25.1338C20.3382 24.557 19.5407 23.733 18.9665 22.6618C18.3922 21.5905 18.1051 20.338 18.1051 18.9042C18.1051 17.4704 18.3843 16.2179 18.9425 15.1467C19.5168 14.0754 20.3143 13.2514 21.3351 12.6746C22.356 12.0978 23.5283 11.8094 24.8522 11.8094C26.1442 11.8094 27.2927 12.0895 28.2975 12.6499C29.3024 13.2102 30.084 14.0095 30.6423 15.0478C31.2165 16.0861 31.5036 17.2974 31.5036 18.6817ZM27.3166 17.5693C27.3166 16.8442 27.0773 16.2673 26.5988 15.8388C26.1203 15.4104 25.5221 15.1961 24.8044 15.1961C24.1185 15.1961 23.5363 15.4021 23.0578 15.8141C22.5952 16.2261 22.3081 16.8112 22.1965 17.5693H27.3166Z" fill="black"/>
              <path d="M50.6972 11.8588C52.356 11.8588 53.672 12.3779 54.6449 13.4162C55.6339 14.4545 56.1283 15.8965 56.1283 17.7423V25.8013H52.0609V18.3109C52.0609 17.421 51.8297 16.737 51.3671 16.2591C50.9205 15.7647 50.2984 15.5175 49.5009 15.5175C48.7034 15.5175 48.0733 15.7647 47.6107 16.2591C47.1641 16.737 46.9408 17.421 46.9408 18.3109V25.8013H42.8734V18.3109C42.8734 17.421 42.6421 16.737 42.1796 16.2591C41.733 15.7647 41.1109 15.5175 40.3134 15.5175C39.5158 15.5175 38.8858 15.7647 38.4232 16.2591C37.9766 16.737 37.7533 17.421 37.7533 18.3109V25.8013H33.662V12.0071H37.7533V13.7376C38.168 13.1608 38.7103 12.7076 39.3802 12.3779C40.0502 12.0319 40.8078 11.8588 41.6532 11.8588C42.6581 11.8588 43.5513 12.0813 44.3329 12.5263C45.1304 12.9712 45.7525 13.6057 46.1991 14.4298C46.6617 13.6717 47.2917 13.0536 48.0893 12.5757C48.8868 12.0978 49.7561 11.8588 50.6972 11.8588Z" fill="black"/>
              <path d="M61.0473 10.5733C60.3296 10.5733 59.7394 10.3591 59.2768 9.9306C58.8302 9.48562 58.6069 8.94177 58.6069 8.29903C58.6069 7.63981 58.8302 7.09595 59.2768 6.66746C59.7394 6.22249 60.3296 6 61.0473 6C61.7492 6 62.3234 6.22249 62.77 6.66746C63.2326 7.09595 63.4639 7.63981 63.4639 8.29903C63.4639 8.94177 63.2326 9.48562 62.77 9.9306C62.3234 10.3591 61.7492 10.5733 61.0473 10.5733ZM63.081 12.0071V25.8013H58.9897V12.0071H63.081Z" fill="black"/>
              <path d="M74.1808 11.8588C75.7439 11.8588 76.9881 12.3862 77.9132 13.4409C78.8543 14.4792 79.3248 15.913 79.3248 17.7423V25.8013H75.2574V18.3109C75.2574 17.388 75.0261 16.6711 74.5636 16.1602C74.101 15.6493 73.4789 15.3939 72.6974 15.3939C71.9158 15.3939 71.2937 15.6493 70.8311 16.1602C70.3686 16.6711 70.1373 17.388 70.1373 18.3109V25.8013H66.046V12.0071H70.1373V13.8365C70.552 13.2267 71.1103 12.7488 71.8121 12.4027C72.5139 12.0401 73.3035 11.8588 74.1808 11.8588Z" fill="black"/>
              <path d="M84.2255 10.5733C83.5077 10.5733 82.9176 10.3591 82.455 9.9306C82.0084 9.48562 81.7851 8.94177 81.7851 8.29903C81.7851 7.63981 82.0084 7.09595 82.455 6.66746C82.9176 6.22249 83.5077 6 84.2255 6C84.9273 6 85.5015 6.22249 85.9482 6.66746C86.4107 7.09595 86.642 7.63981 86.642 8.29903C86.642 8.94177 86.4107 9.48562 85.9482 9.9306C85.5015 10.3591 84.9273 10.5733 84.2255 10.5733ZM86.2592 12.0071V25.8013H82.1679V12.0071H86.2592Z" fill="black"/>
              <path d="M88.937 23.7412H99.3049V25.8013H88.937V23.7412Z" fill="#5009DC"/>
            </svg>
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
