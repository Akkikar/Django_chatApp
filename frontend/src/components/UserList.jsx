import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserList.css';  // Importing CSS file for UserList styling

const UserList = ({ onSelectUser, currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/users/')
      .then((response) => {
        const filteredUsers = response.data.filter(user => user.id !== currentUserId);
        setUsers(filteredUsers);
        setLoading(false);
      })
      .catch((err) => {
        setError('Error fetching users');
        setLoading(false);
      });
  }, [currentUserId]);

  return (
    <div className="user-list">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="user-list-container">
          <input type="text" placeholder="Search..." className="search-bar" />
          <ul>
            {users.map((user) => (
              <li key={user.id} onClick={() => onSelectUser(user)} className="user-item">
                <div className="user-avatar"></div>
                <div className="user-details">
                  <p className="username">{user.username}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserList;
