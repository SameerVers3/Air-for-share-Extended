import { useEffect, useState, useRef } from 'react';
import { RoomManager } from '../Classes/RoomManager';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLogin } from 'react-icons/hi';
import { MdAddToPhotos } from 'react-icons/md';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify'; // Import react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import the styles

function Index() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('join');
  const [roomId, setRoomId] = useState(['', '', '', '', '']);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomManager, setRoomManager] = useState(null);
  const [ip, setIp] = useState(null);
  const inputsRef = useRef([]);

  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then((response) => response.json())
      .then((data) => setIp(data.ip));
  }, []);

  useEffect(() => {
    setRoomManager(new RoomManager());
  }, [ip]);

  const handleCreateRoom = async () => {
    if (!roomManager) return;

    if (ip) {
      setLoading(true);
      try {
        await roomManager.createRoom(ip);
        toast.success(`Room created with ID: ${roomManager.roomId}`); // Success notification
        navigate(`/r/${roomManager.roomId}`);
      } catch (e) {
        toast.error('Failed to create room'); // Error notification
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('IP address not available'); // Error notification
    }
  };

  const handleJoinRoom = async () => {
    const roomID = roomId.join('');

    if (!roomID) {
      toast.error('Please enter room ID'); // Error notification
      return;
    }

    setLoading(true);
    try {
      navigate(`/r/${roomID}`);
      toast.success('Joining room...'); // Success notification
    } catch (e) {
      toast.error('Failed to join room'); // Error notification
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, index) => {
    const value = e.target.value;
    if (value.length > 1) return;

    const newRoomId = [...roomId];
    newRoomId[index] = value;
    setRoomId(newRoomId);

    if (value && index < roomId.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !roomId[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleKeyDown2 = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleJoinRoom();
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-violet-700">
        Air For Share Extended
      </h2>

      <p className="mb-4 text-center text-2xl font-bold text-gray-400">Where You Can Join or Create a Room</p>

      <div className="max-w-full mx-auto">
        <ul
          onMouseLeave={() => {
            setPosition((pv) => ({
              ...pv,
              opacity: 0,
            }));
          }}
          className="relative flex flex-wrap gap-x-2 justify-center mb-8"
        >
          <Tab setPosition={setPosition} onClick={() => setActiveTab('join')} active={activeTab === 'join'}>
            <HiOutlineLogin className="mr-2" />
            Join
          </Tab>
          <Tab setPosition={setPosition} onClick={() => setActiveTab('create')} active={activeTab === 'create'}>
            <MdAddToPhotos className="mr-2" />
            Create
          </Tab>
          <Cursor position={position} />
        </ul>

        <div className="mx-auto w-full md:w-1/2 lg:w-1/3">
          {activeTab === 'join' && (
            <div className="bg-white px-4 sm:px-8 py-10 rounded-xl shadow">
              <header className="mb-8">
                <h1 className="text-2xl font-bold mb-1">Join Room with Verification</h1>
                <p className="text-sm text-slate-500">Enter the room ID or the 5-digit verification code.</p>
              </header>
              <form id="otp-form" onKeyDown={handleKeyDown2}>
                <div className="flex items-center justify-center gap-3">
                  {roomId.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputsRef.current[index] = el)}
                      type="text"
                      className="w-12 h-12 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 rounded p-2 sm:p-3 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 flex-grow"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      style={{ flexBasis: '0', flexGrow: 1 }}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 transition-colors duration-150"
                    onClick={handleJoinRoom}
                    disabled={loading}
                  >
                    {loading ? 'Joining...' : 'Join Room'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="bg-white px-4 sm:px-8 py-10 rounded-xl shadow">
              <header className="mb-8">
                <h1 className="text-2xl font-bold mb-1">Create a New Room</h1>
                <p className="text-sm text-slate-500">Enter a name for your new room.</p>
              </header>
              <input
                type="text"
                className="w-full px-3 py-2 text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Room Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <div className="mt-4">
                <button
                  className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 transition-colors duration-150"
                  onClick={handleCreateRoom}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

const Tab = ({ children, setPosition, onClick, active }) => {
  const ref = useRef(null);
  return (
    <li
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => {
        if (!ref?.current) return;
        const { width, left } = ref.current.getBoundingClientRect();
        setPosition({
          left: left - ref.current.parentElement.getBoundingClientRect().left,
          width,
          opacity: 1,
        });
      }}
      className={`relative z-10 flex items-center justify-center cursor-pointer px-4 py-2 text-sm font-semibold transition-colors duration-200 ease-in-out ${active ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}
    >
      {children}
    </li>
  );
};

const Cursor = ({ position }) => {
  return (
    <motion.div
      className="absolute bottom-0 left-0 h-0.5 bg-indigo-500"
      style={{
        width: position.width,
        left: position.left,
        opacity: position.opacity,
      }}
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: position.opacity, width: position.width }}
      transition={{ duration: 0.3 }}
    />
  );
};

export default Index;
