import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './CreateUser.css';

const CreateUser = () => {
  const [userData, setUserData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      await axios.post('http://127.0.0.1:8000/user/create/', userData);
      alert('User created successfully!');
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error creating user:', error);
      setErrorMessage('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="create-user-form">
        <input
          type="text"
          placeholder="Username"
          value={userData.username}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
          className="create-user-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={userData.password}
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
          className="create-user-input"
          required
        />
        <button type="submit" className="create-user-button" disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <p className="login-link">
        Already a user? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default CreateUser;
