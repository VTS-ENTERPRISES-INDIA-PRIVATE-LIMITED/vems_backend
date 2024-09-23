import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css'; 

const CLOUDINARY_UPLOAD_PRESET = 'Viharikha'; // Replace with your preset
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dku9u5u1x/image/upload';

const Login = () => {
  const [VendorName, setVendorName] = useState('');
  const [ContactNumber, setContactNumber] = useState('');
  const [Email, setEmail] = useState('');
  const [Address, setAddress] = useState('');
  
  const [AadharCardUpload, setAadharCardUpload] = useState(null);
  const [AgreementUpload, setAgreementUpload] = useState(null);
 
  const [AccountHandlerName, setAccountHandlerName] = useState('');
  const [AccountNumber, setAccountNumber] = useState('');
  const [BankName, setBankName] = useState('');
  const [BranchName, setBranchName] = useState('');
  const [IFSCCode, setIFSCCode] = useState('');

  // New State for Agreement Details
  const [AgreementStartDate, setAgreementStartDate] = useState('');
  const [AgreementEndDate, setAgreementEndDate] = useState('');
  const [AgreementAmount, setAgreementAmount] = useState('');

  const navigate = useNavigate();

  const handleFileChange = (setter) => (e) => {
    setter(e.target.files[0]);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.secure_url; // Return the uploaded image URL
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const aadharImageUrl = AadharCardUpload ? await uploadToCloudinary(AadharCardUpload) : null;
      const agreementImageUrl = AgreementUpload ? await uploadToCloudinary(AgreementUpload) : null;

      const formData = {
        VendorName,
        ContactNumber,
        Email,
        Address,
        AadharCardUpload: aadharImageUrl,
        AgreementUpload: agreementImageUrl,
        AccountHandlerName,
        AccountNumber,
        BankName,
        BranchName,
        IFSCCode,
        AgreementStartDate,
        AgreementEndDate,
        AgreementAmount,
      };

      const response = await axios.post('http://localhost:8000/register', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response && response.data) {
        alert(response.data.message);
        navigate('/user');
      } else {
        alert('Unexpected response format');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Registration failed: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <div className="vendor-registration-container">
      <div className="registration-card">
        <div className="registration-form-container">
          <h2>Vendor Registration</h2>
          <form className="vendor-registration-form" onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="form-section">
              <h3>Personal Information</h3>
              <div>
                <label htmlFor="VendorName">Vendor Name</label>
                <input
                  type="text"
                  id="VendorName"
                  value={VendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="Email">Email</label>
                <input
                  type="Email"
                  id="Email"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ContactNumber">Contact Number</label>
                <input
                  type="text"
                  id="ContactNumber"
                  value={ContactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="Address">Address</label>
                <input
                  type="text"
                  id="Address"
                  value={Address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Upload Section */}
            <div className="form-section">
              <h3>Upload Section</h3>
              <div>
                <label htmlFor="AadharCardUpload">Aadhar Card Upload</label>
                <input
                  type="file"
                  id="AadharCardUpload"
                  onChange={handleFileChange(setAadharCardUpload)}
                  required
                />
              </div>
              <div>
                <label htmlFor="AgreementUpload">Agreement Upload</label>
                <input
                  type="file"
                  id="AgreementUpload"
                  onChange={handleFileChange(setAgreementUpload)}
                  required
                />
              </div>
            </div>

            {/* Account Details Section */}
            <div className="form-section">
              <h3>Account Details</h3>
              <div>
                <label htmlFor="AccountHandlerName">Account Handler Name</label>
                <input
                  type="text"
                  id="AccountHandlerName"
                  value={AccountHandlerName}
                  onChange={(e) => setAccountHandlerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="AccountNumber">Account Number</label>
                <input
                  type="text"
                  id="AccountNumber"
                  value={AccountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="BankName">Bank Name</label>
                <input
                  type="text"
                  id="BankName"
                  value={BankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="BranchName">Branch Name</label>
                <input
                  type="text"
                  id="BranchName"
                  value={BranchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="IFSCCode">IFSC Code</label>
                <input
                  type="text"
                  id="IFSCCode"
                  value={IFSCCode}
                  onChange={(e) => setIFSCCode(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Agreement Details Section */}
            <div className="form-section">
              <h3>Agreement Details</h3>
              <div>
                <label htmlFor="AgreementStartDate">Agreement Start Date</label>
                <input
                  type="date"
                  id="AgreementStartDate"
                  value={AgreementStartDate}
                  onChange={(e) => setAgreementStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="AgreementEndDate">Agreement End Date</label>
                <input
                  type="date"
                  id="AgreementEndDate"
                  value={AgreementEndDate}
                  onChange={(e) => setAgreementEndDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="AgreementAmount">Agreement Amount</label>
                <input
                  type="number"
                  step="0.01"
                  id="AgreementAmount"
                  value={AgreementAmount}
                  onChange={(e) => setAgreementAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit">Register Vendor</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
