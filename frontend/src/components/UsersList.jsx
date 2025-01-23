import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UsersList.css';

const UsersList = ({ token, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/userslist/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userList = response.data.results || [];
        setUsers(userList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="users-list-container">
      <h2 className="users-list-title">Users</h2>
      <ul className="users-list">
        {users.map((user) => (
          <li 
            key={user.id} 
            className="user-item" 
            onClick={() => onSelectUser(user.username)}
          >
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;
