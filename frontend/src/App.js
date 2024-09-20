import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import User from './User';
import Vendordetails from './Vendordetails';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<User />} />
        <Route path="/vendordetails/:VendorName" element={<Vendordetails />} />
        <Route path="/login" element={<Login/>} />
      </Routes>
    </Router>
  );
};

export default App;
