import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import CreateUser from './components/CreateUser';
import UsersList from './components/UsersList';
import Chat from './components/Chat';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  return (
    <Router>
      <Routes>
      <Route path="/" element={<CreateUser />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/users-list" element={<UsersList token={token} />} />
        <Route path="/chat" element={<Chat token={token} />} />
      </Routes>
    </Router>
  );
};

export default App;
