import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Vendordetails.css';
import { FaUser, FaFileAlt, FaDownload, FaUniversity } from 'react-icons/fa';

const Vendordetails = () => {
    const [vendor, setVendor] = useState(null);
    const { VendorName } = useParams();

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/user/${VendorName}`);
                if (response && response.data) {
                    setVendor(response.data);
                } else {
                    console.error('Unexpected response format:', response);
                    alert('Unexpected response format');
                }
            } catch (error) {
                console.error('Error fetching vendor details:', error.response || error.message);
                alert('Failed to fetch vendor details. Please check the console for more information.');
            }
        };

        fetchVendor();
    }, [VendorName]);

    
    if (!vendor) {
        return <div>Loading...</div>;
    }

    return (
        <div className="vendor-registration-container">
            <div className="registration-card">
                {/* Personal Information Section */}
                <div className="form-section personal-info">
                    <h3><FaUser /> Personal Information</h3>
                    <p><strong>Vendor Name:</strong> {vendor.VendorName}</p>
                    <p><strong>Contact Number:</strong> {vendor.ContactNumber}</p>
                    <p><strong>Email:</strong> {vendor.Email}</p>
                    <p><strong>Address:</strong> {vendor.Address}</p>
                </div>

                {/* Document Upload Section */}
                <div className="form-section uploaded-documents">
                    <h3><FaFileAlt /> Uploaded Documents</h3>
                    <div className="file-container">
                        <div className="file-item">
                            <p><strong>Aadhar Card:</strong></p>
                            {vendor.AadharCardUpload ? (
                                <a href={`http://localhost:8000/uploads/${vendor.AadharCardUpload}`} download>
                                    <button className="download-btn">
                                        <FaDownload /> Download Aadhar Card
                                    </button>
                                </a>
                            ) : (
                                <p>Not uploaded</p>
                            )}
                        </div>
                        <div className="file-item">
                            <p><strong>Agreement:</strong></p>
                            {vendor.AgreementUpload ? (
                                <a href={`http://localhost:8000/uploads/${vendor.AgreementUpload}`} download>
                                    <button className="download-btn">
                                        <FaDownload /> Download Agreement
                                    </button>
                                </a>
                            ) : (
                                <p>Not uploaded</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bank Details Section */}
                <div className="form-section bank-details">
                    <h3><FaUniversity /> Bank Details</h3>
                    <p><strong>Account Handler Name:</strong> {vendor.AccountHandlerName}</p>
                    <p><strong>Account Number:</strong> {vendor.AccountNumber}</p>
                    <p><strong>Bank Name:</strong> {vendor.BankName}</p>
                    <p><strong>Branch Name:</strong> {vendor.BranchName}</p>
                    <p><strong>IFSC Code:</strong> {vendor.IFSCCode}</p>
                </div>

                {/* Agreement Section */}
                <div className="form-section agreement-details">
                    <h3><FaFileAlt /> Agreement Details</h3>
                    <p><strong>Agreement Start Date:</strong> {vendor.AgreementStartDate}</p>
                    <p><strong>Agreement End Date:</strong> {vendor.AgreementEndDate}</p>
                    <p><strong>Agreement Amount:</strong> {vendor.AgreementAmount}</p>
                </div>
            </div>
        </div>
    );
};

export default Vendordetails;
