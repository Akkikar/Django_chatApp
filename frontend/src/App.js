// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // Mock for login state

  // Mock check for user login status (replace with actual login check)
  useEffect(() => {
    // Here you can check login status from local storage, Redux, etc.
    const user = localStorage.getItem('user'); // example of checking local storage
    if (user) setIsUserLoggedIn(true);
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/chat"
            element={isUserLoggedIn ? <Chat /> : <Login />} // Redirect if not logged in
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
