import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { RoomManager } from '../Classes/RoomManager';

const Room = () => {
  const { id } = useParams<{ id: string }>();
  const [ip, setIp] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [roomManager, setRoomManager] = useState<RoomManager | null>(null);
  const [joined, setJoined] = useState<boolean>(false); // Track join status
  const [message, setMessage] = useState<string>(""); // For textarea input

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then((response) => response.json())
      .then((data) => setIp(data.ip));
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }
    setRoomId(id);
    setRoomManager(new RoomManager());
  }, [id]);

  useEffect(() => {
    const joinRoom = async () => {
      if (!ip || !roomId) {
        return;
      }

      if (!roomManager) {
        setRoomManager(new RoomManager());
      }

      setLoading(true); // Start loading

      try {
        const joinRes = await roomManager?.joinRoom(roomId, ip);

        if (joinRes?.success) {
          console.log("Joined room with ID: ", roomId);
          setJoined(true);
          setError("");
          // Start listening for messages after successfully joining
          roomManager?.listenForMessages((message) => {
            setMessage(message); // Update the displayed message
          });
        } else {
          console.log("Failed to join room");
          setJoined(false);
          setError("Failed to join room or room does not exist");
        }
      } catch (error) {
        console.error("Error joining room: ", error);
        setJoined(false);
        setError("An error occurred while joining the room");
      } finally {
        setLoading(false); // End loading
      }
    };

    joinRoom();
  }, [ip, roomId, roomManager]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message)
      .then(() => alert("Message copied to clipboard!"))
      .catch((error) => console.error("Failed to copy message: ", error));
  };

  const handleChange = (value: string) => {
    // add that effect where the message is updated in real-time
    handleupdateMessage(value);
  }

  const handleupdateMessage = async (value: string) => {
    if (roomManager && message.trim()) {
      try {
        await roomManager.sendMessage(value);
        setMessage(value);
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Room ID: {id}</h2>

      {loading && <p>Loading...</p>}

      {joined ? (
        <div className="relative">
          <textarea
            className="w-full mt-4 p-2 border border-gray-300 rounded"
            placeholder="Enter your message here..."
            value={message}
            onChange={(e) => handleChange(e.target.value)}
          />
            <button
              className="absolute top-0 right-0 mt-2 mr-2 bg-blue-500 text-white p-1 rounded"
              onClick={handleCopyMessage}
            >
              Copy
            </button>
        </div>
      ) : (
        error && <p className="text-red-500 mt-4">{error}</p>
      )}
    </div>
  );
};

export default Room;
