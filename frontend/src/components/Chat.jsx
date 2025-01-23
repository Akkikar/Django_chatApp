import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

import './Chat.css';
import UsersList from './UsersList';

const Chat = ({ token }) => {
  const [receiverUsername, setReceiverUsername] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null);

 
  useEffect(() => {
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.user_id; // Using the user_id from the token
    setUserId(userId);
    
    // Fetch the username from the backend using the user ID
    const fetchUsername = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/get-username/${userId}/`, { // Make an API request to get username
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(response.data.username); // Assuming the response has { username: '...' }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    if (userId) {
      fetchUsername();
    }
  }, [token]);


  useEffect(() => {
    if (receiverUsername) {
      const socketInstance = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${receiverUsername}/`);
  
      socketInstance.onopen = () => {
        console.log("WebSocket connected");
      };
  
      socketInstance.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, messageData]);
      };
  
      socketInstance.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };
  
      socketInstance.onclose = () => {
        console.log("WebSocket closed");
      };
  
      setSocket(socketInstance);
  
      return () => {
        socketInstance.close();
      };
    }
  }, [receiverUsername]);
  
  

  // Fetch previous messages
  useEffect(() => {
    if (receiverUsername) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/chat/${receiverUsername}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [receiverUsername, token]);

  const decodedToken = jwtDecode(token);
  const currentUserId = decodedToken.user_id;

  // Handle sending a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (socket && newMessage.trim()) {
      const messageData = {
        content: newMessage,
        sender: { username: username, id: currentUserId }, // Include correct sender details
      };
      socket.send(JSON.stringify(messageData));
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setNewMessage('');
    }
  };
  

  return (
    <div className="chat-container">
      <div className="left-pane">
        <UsersList token={token} onSelectUser={setReceiverUsername} />
      </div>
      <div className="right-pane">
        {receiverUsername ? (
          <>
            <h3>Chat with {receiverUsername}</h3>
            <div className="message-list">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${
                      message.sender?.username === 'You' ? 'sent' : 'received'
                    }`}
                  >
                    <strong>{message.sender?.username || 'Unknown'}:</strong> {message.content || message.message}
                  </div>
                ))}
             </div>


            <form onSubmit={sendMessage} className="message-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                className="message-input"
              />
              <button type="submit" className="send-button">
                Send
              </button>
            </form>
          </>
        ) : (
          <div>Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default Chat;
