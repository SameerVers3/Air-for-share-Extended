import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { RoomManager } from '../Classes/RoomManager';
import useDebounce from '../hooks/useDebounce'; // Adjust the import path as necessary
import { FiCopy, FiShare2 } from 'react-icons/fi'; // Import icons from react-icons
import { ToastContainer, toast } from 'react-toastify'; // Import react-toastify for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify CSS

const Room = () => {
  const { id } = useParams<{ id: string }>();
  const [ip, setIp] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // Start with loading state as true
  const [roomManager, setRoomManager] = useState<RoomManager | null>(null);
  const [joined, setJoined] = useState<boolean>(false); // Track join status
  const [message, setMessage] = useState<string>(""); // For textarea input
  const debouncedMessage = useDebounce(message, 500); // Adjust the debounce delay as necessary
  const textareaRef = useRef<HTMLTextAreaElement | null>(null); // Ref for textarea

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then((response) => response.json())
      .then((data) => setIp(data.ip));
  }, []);

  useEffect(() => {
    if (!id) return;
    setRoomId(id);
    setRoomManager(new RoomManager());
  }, [id]);

  useEffect(() => {
    const joinRoom = async () => {
      if (!ip || !roomId) return;

      if (!roomManager) {
        setRoomManager(new RoomManager());
      }

      setLoading(true);

      try {
        const joinRes = await roomManager?.joinRoom(roomId, ip);

        if (joinRes?.success) {
          console.log("Joined room with ID: ", roomId);
          setJoined(true);
          setError("");
          roomManager?.listenForMessages((message) => {
            setMessage(message);
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
        setLoading(false);
      }
    };

    joinRoom();
  }, [ip, roomId, roomManager]);

  useEffect(() => {
    if (roomManager && debouncedMessage.trim()) {
      const sendDebouncedMessage = async () => {
        try {
          console.log("Sending message: ", debouncedMessage);
          await roomManager.sendMessage(debouncedMessage);
        } catch (error) {
          console.error("Error sending message: ", error);
        }
      };

      sendDebouncedMessage();
    }
  }, [debouncedMessage, roomManager]);

  useEffect(() => {
    // Adjust the height of the textarea based on its scroll height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to auto to get the new scroll height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]); // Run this effect whenever the message changes

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message)
      .then(() => toast.success("Message copied to clipboard!"))
      .catch((error) => console.error("Failed to copy message: ", error));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success("Room link copied to clipboard!"))
      .catch((error) => console.error("Failed to copy link: ", error));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this room!',
        url: window.location.href,
      }).catch((error) => console.error("Failed to share: ", error));
    } else {
      toast.error("Sharing is not supported in this browser.");
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {loading ? (
        <div className="absolute inset-0 flex justify-center items-center bg-gray-100 opacity-90">
          <div
            className="w-32 aspect-square rounded-full relative flex justify-center items-center animate-[spin_3s_linear_infinite] z-40 bg-[conic-gradient(white_0deg,white_300deg,transparent_270deg,transparent_360deg)] before:animate-[spin_2s_linear_infinite] before:absolute before:w-[60%] before:aspect-square before:rounded-full before:z-[80] before:bg-[conic-gradient(white_0deg,white_270deg,transparent_180deg,transparent_360deg)] after:absolute after:w-3/4 after:aspect-square after:rounded-full after:z-[60] after:animate-[spin_3s_linear_infinite] after:bg-[conic-gradient(#065f46_0deg,#065f46_180deg,transparent_180deg,transparent_360deg)]"
          >
            <span
              className="absolute w-[85%] aspect-square rounded-full z-[60] animate-[spin_5s_linear_infinite] bg-[conic-gradient(#34d399_0deg,#34d399_180deg,transparent_180deg,transparent_360deg)]"
            >
            </span>
          </div>
        </div>
      ) : (
        <div className="p-6 max-w-4xl mx-auto bg-gray-50 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900">Room ID: {id}</h2>
            <div className="flex space-x-4">
              <button
                title="Copy Link"
                className="cursor-pointer flex items-center gap-x-2 fill-blue-400 bg-blue-950 hover:bg-blue-900 active:border active:border-blue-400 rounded-md duration-100 p-2"
                onClick={handleCopyLink}
              >
                <FiCopy className="text-blue-400" size={20} />
                <span className="text-sm text-blue-400 font-bold">Copy Link</span>
              </button>
              <button
                title="Share"
                className="cursor-pointer flex items-center gap-x-2 fill-green-400 bg-green-950 hover:bg-green-900 active:border active:border-green-400 rounded-md duration-100 p-2"
                onClick={handleShare}
              >
                <FiShare2 className="text-green-400" size={20} />
                <span className="text-sm text-green-400 font-bold">Share</span>
              </button>
            </div>
          </div>

          {joined ? (
            <div className="relative bg-white p-6 rounded-lg shadow-md">
              <textarea
                ref={textareaRef}
                className="w-full p-3 h-[60vh] text-lg font-md border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-150 resize-none overflow-hidden"
                placeholder="Enter your message here..."
                value={message}
                onChange={(e) => handleChange(e.target.value)}
              />
              <button
                className="absolute top-3 right-3 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={handleCopyMessage}
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
          ) : (
            error && <p className="text-red-500 text-center mt-4">{error}</p>
          )}

          <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        </div>
      )}
    </div>
  );
};

export default Room;
