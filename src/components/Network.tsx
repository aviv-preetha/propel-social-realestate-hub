
import React, { useState } from 'react';
import { UserPlus, Users, MessageCircle, Star, Check, Clock } from 'lucide-react';
import UserBadge from './UserBadge';
import { useConnections } from '@/hooks/useConnections';

const Network: React.FC = () => {
  const { 
    connections, 
    suggestions, 
    loading, 
    connect, 
    acceptConnection,
    disconnect, 
    getConnectionStatus,
    getPendingConnectionId
  } = useConnections();
  const [activeTab, setActiveTab] = useState<'discover' | 'connections'>('discover');

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <p className="text-gray-500">Loading network...</p>
        </div>
      </div>
    );
  }

  const renderConnectionButton = (user: any) => {
    const status = getConnectionStatus(user.id);
    
    switch (status) {
      case 'connected':
        return (
          <button
            onClick={() => disconnect(user.id)}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Disconnect
          </button>
        );
      
      case 'pending':
        return (
          <button
            disabled
            className="flex items-center space-x-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
          >
            <Clock className="h-4 w-4" />
            <span>Pending</span>
          </button>
        );
      
      case 'received':
        return (
          <button
            onClick={() => {
              const connectionId = getPendingConnectionId(user.id);
              if (connectionId) acceptConnection(connectionId);
            }}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Check className="h-4 w-4" />
            <span>Accept</span>
          </button>
        );
      
      default:
        return (
          <button
            onClick={() => connect(user.id)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Connect</span>
          </button>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Network</h2>
        
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'discover'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Discover People
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'connections'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            My Connections ({connections.length})
          </button>
        </div>
      </div>

      {activeTab === 'discover' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">People you may know</h3>
          {suggestions.length > 0 ? (
            suggestions.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <UserBadge badge={user.badge} />
                    </div>
                    <p className="text-gray-600 mb-2">{user.location}</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{user.description}</p>
                    {user.listing_preference && (
                      <p className="text-blue-600 text-sm mt-2 font-medium">
                        Preference: {user.listing_preference}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {renderConnectionButton(user)}
                    <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <p className="text-gray-500 text-lg">No suggestions available</p>
              <p className="text-gray-400">Check back later for new connection opportunities</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'connections' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Your connections</h3>
          {connections.length > 0 ? (
            connections.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <UserBadge badge={user.badge} />
                    </div>
                    <p className="text-gray-600 mb-2">{user.location}</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{user.description}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>Message</span>
                    </button>
                    {user.badge === 'business' && (
                      <button className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium hover:bg-yellow-200 transition-colors">
                        <Star className="h-4 w-4" />
                        <span>Rate</span>
                      </button>
                    )}
                    <button
                      onClick={() => disconnect(user.id)}
                      className="text-sm text-red-600 hover:text-red-800 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No connections yet</p>
              <p className="text-gray-400">Start connecting with people in the real estate industry</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Network;
