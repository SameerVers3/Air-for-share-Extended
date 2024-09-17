import { useEffect, useState } from 'react';
import { RoomManager } from '../Classes/RoomManager';

function Index() {
  const [activeTab, setActiveTab] = useState('join');
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [roomManager, setRoomManager] = useState<RoomManager | null>(null);
  const [ip, setIp] = useState(null);

  // Fetch the user's IP address
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then((response) => response.json())
      .then((data) => setIp(data.ip));
  }, []);

  // Initialize RoomManager once the IP is available
  useEffect(() => {
    setRoomManager(new RoomManager());
  }, [ip]);
  
  // Handle room creation
  const handleCreateRoom = async () => {
    if (!roomManager) {
      return;
    }

    if (ip) {
      setLoading(true); // Set loading state
      try {
        await roomManager.createRoom(ip);
        console.log('Room created with ID:', roomManager.roomId);
        setError('');
      } catch (e) {
        setError('Failed to create room');
      } finally {
        setLoading(false); // Stop loading state
      }
    } else {
      setError('IP address not available');
    }
  };

  // Handle joining a room
  const handleJoinRoom = async () => {
    if (!roomId) {
      setError('Please enter room ID');
      return;
    }

    setLoading(true); // Set loading state
    try {
      // Logic to join a room (placeholder for actual functionality)
      console.log('Joining room with ID:', roomId);
      setError('');
    } catch (e) {
      setError('Failed to join room');
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="container mx-auto p-4 pt-6 mt-10">
      <h2 className="text-3xl font-bold mb-4 text-center">Air For Share Extended</h2>
      <p className="mb-4 text-center">Join or Create a Room</p>

      {/* Tabs */}
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'join' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setActiveTab('join')}
        >
          Join Room
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setActiveTab('create')}
        >
          Create Room
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-md mx-auto">
        {activeTab === 'join' && (
          <div className="p-4 border-2 border-gray-200 rounded-md shadow-md">
            <input
              type="text"
              className="input input-bordered w-full mt-2"
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button className="btn btn-primary mt-4" onClick={handleJoinRoom} disabled={loading}>
              {loading ? 'Joining...' : 'Join Room'}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="p-4 border-2 border-gray-200 rounded-md shadow-md">
            <input
              type="text"
              className="input input-bordered w-full mt-2"
              placeholder="Room Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <button className="btn btn-secondary mt-4" onClick={handleCreateRoom} disabled={loading}>
              {loading ? 'Creating...' : 'Create Room'}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Index;
