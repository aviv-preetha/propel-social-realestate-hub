
import { Connection, ConnectionStatus } from '@/types/connections';

export const connectionUtils = {
  getConnectionStatus(
    profileId: string,
    targetProfileId: string,
    connections: any[],
    pendingConnections: Connection[]
  ): ConnectionStatus {
    console.log('Checking connection status for:', targetProfileId);
    console.log('Current connections:', connections.map(c => c.id));
    console.log('Pending connections:', pendingConnections);
    
    // Check if already connected
    if (connections.some(p => p.id === targetProfileId)) {
      console.log('Found in connections - status: connected');
      return 'connected';
    }
    
    // Check if pending (I sent the request)
    const sentRequest = pendingConnections.find(conn => 
      conn.user_id === profileId && conn.connected_user_id === targetProfileId
    );
    if (sentRequest) {
      console.log('Found sent request - status: pending');
      return 'pending';
    }
    
    // Check if I received a request
    const receivedRequest = pendingConnections.find(conn => 
      conn.connected_user_id === profileId && conn.user_id === targetProfileId
    );
    if (receivedRequest) {
      console.log('Found received request - status: received');
      return 'received';
    }
    
    console.log('No connection found - status: none');
    return 'none';
  },

  getPendingConnectionId(
    profileId: string,
    targetProfileId: string,
    pendingConnections: Connection[]
  ): string | undefined {
    const connection = pendingConnections.find(conn => 
      (conn.user_id === targetProfileId && conn.connected_user_id === profileId) ||
      (conn.connected_user_id === targetProfileId && conn.user_id === profileId)
    );
    return connection?.id;
  }
};
