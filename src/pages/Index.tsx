
import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import Feed from '../components/Feed';
import Network from '../components/Network';
import Properties from '../components/Properties';
import Profile from '../components/Profile';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Feed />;
      case 'network':
        return <Network />;
      case 'properties':
        return <Properties />;
      case 'profile':
        return <Profile />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="py-8 px-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
