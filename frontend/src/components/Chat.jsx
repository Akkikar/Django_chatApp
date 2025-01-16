import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserList from './UserList';
import './Chat.css';  // Importing the CSS file for Chat styling

const Chat = () => {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const isUserLoggedIn = true;

  useEffect(() => {
    if (!isUserLoggedIn) {
      navigate('/login');
    } else {
      const userId = localStorage.getItem('user_id');
      setCurrentUserId(userId);

      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/`);
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        setMessages((prevMessages) => [...prevMessages, data.message]);
      };
      setSocket(ws);
      return () => {
        ws.close();
      };
    }
  }, [roomName, isUserLoggedIn, navigate]);

  const sendMessage = () => {
    if (message.trim() === '') return;
    if (socket) {
      socket.send(JSON.stringify({ message }));
      setMessage('');
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user); // Set the selected user
  };

  return (
    <div className="chat-container">
      {!currentUserId && <UserList onSelectUser={handleSelectUser} currentUserId={currentUserId} />}
      <div className="chat-box">
        {selectedUser && (
          <div className="chat-header">
            <div className="chat-user-avatar"></div>
            <h4 className="chat-user-name">Chat with {selectedUser.username}</h4>
          </div>
        )}
        <div className="messages">
          {messages.length === 0 ? (
            <p>No messages yet</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="message">
                <div className="message-bubble">{msg}</div>
              </div>
            ))
          )}
        </div>
        <div className="message-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="input-box"
          />
          <button onClick={sendMessage} className="send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
