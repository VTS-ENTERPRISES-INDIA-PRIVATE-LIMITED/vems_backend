import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Vendordetails.css';
import { FaUser, FaFileAlt, FaPhone, FaDownload, FaUniversity, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaMoneyCheckAlt } from 'react-icons/fa';

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
            <div className="vendor-header-card">
                <div className="vendor-info">
                    <div className="vendor-icon">
                        <img src="https://res.cloudinary.com/dlo7urgnj/image/upload/v1726825315/car_op9hch.webp" alt="Vendor Profile" />
                    </div>
                    <div className="vendor-details">
                        <h2>{vendor.VendorName}</h2>
                        <p className="vendor-id">{vendor.VendorId}</p>
                        <p className="last-update">Last Update: {new Date(vendor.lastUpdate).toLocaleString()}</p>
                    </div>
                </div>
                <div className="vendor-status">
                    <button className={vendor.isActive ? "active-button" : "inactive-button"}>
                        {vendor.isActive ? "ACTIVE" : "INACTIVE"}
                    </button>
                </div>
            </div>
            <div className="vendor-stats">
                {/* Example statistics - adjust as necessary */}
                <div className="stat-item"><p className="stat-value">{vendor.totalClients}</p><p className="stat-label">Total Clients</p></div>
                <div className="stat-item"><p className="stat-value">{vendor.totalSites}</p><p className="stat-label">Total Sites</p></div>
                <div className="stat-item"><p className="stat-value">{vendor.totalDistance} Km</p><p className="stat-label">Total Distance</p></div>
                <div className="stat-item"><p className="stat-value">{vendor.totalHours}</p><p className="stat-label">Total Hours</p></div>
                <div className="stat-item"><p className="stat-value">{vendor.totalOfficeTrips}</p><p className="stat-label">Total Office Trips</p></div>
                <div className="stat-item"><p className="stat-value">{vendor.totalRevenue}</p><p className="stat-label">Total Revenue</p></div>
                <div className="stat-item"><p className="stat-value">{vendor.totalVehicles}</p><p className="stat-label">Total Vehicles</p></div>
                <div className="stat-item"><p className="stat-value">{vendor.totalDrivers}</p><p className="stat-label">Total Drivers</p></div>
                <div className="stat-item"><p className="stat-value">{new Date(vendor.joinedDate).toLocaleDateString()}</p><p className="stat-label">Joined Date</p></div>
            </div>

            <div className="personal-info">
                <h3>Personal Information</h3>
                <div className="info-block">
                    <p><FaUser /> <strong>Contact Name:</strong> {vendor.ContactName}</p>
                    <p><FaPhone /> <strong>Phone Number:</strong> {vendor.ContactNumber}</p>
                    <p><FaEnvelope /> <strong>Email Address:</strong> {vendor.Email}</p>
                    <p><FaMapMarkerAlt /> <strong>Address:</strong> {vendor.Address}</p>
                </div>
            </div>

            <div className="below-cards">
                <div className="verification-documents">
                    <h3>Verification Documents Uploads</h3>
                    <div className="document-item">
                        <p><strong>Aadhar Card</strong></p>
                        {vendor.AadharCardUpload ? (
                            <a href={vendor.AadharCardUpload} download>
                                <FaDownload /> View
                            </a>
                        ) : <p>Not uploaded</p>}
                    </div>
                    <div className="document-item">
                        <p><strong>Agreement</strong></p>
                        {vendor.AgreementUpload ? (
                            <a href={vendor.AgreementUpload} download>
                                <FaDownload /> View
                            </a>
                        ) : <p>Not uploaded</p>}
                    </div>
                </div>

                <div className="bank-details">
                    <h3>Bank Account Details</h3>
                    <p><FaUniversity /> <strong>Account Holder's Name:</strong> {vendor.AccountHolderName}</p>
                    <p><FaMoneyCheckAlt /> <strong>Account Number:</strong> {vendor.AccountNumber}</p>
                    <p><FaUniversity /> <strong>Bank Name:</strong> {vendor.BankName}</p>
                    <p><FaUniversity /> <strong>Branch Name:</strong> {vendor.BranchName}</p>
                    <p><FaUniversity /> <strong>IFSC Code:</strong> {vendor.IFSCCode}</p>
                    <h3><FaFileAlt /> Agreement Details</h3>
                    <p><strong>Agreement Start Date:</strong> {new Date(vendor.AgreementStartDate).toLocaleDateString()}</p>
                    <p><strong>Agreement End Date:</strong> {new Date(vendor.AgreementEndDate).toLocaleDateString()}</p>
                    <p><strong>Agreement Amount:</strong> {vendor.AgreementAmount}</p>
                </div>
            </div>
        </div>
    );
};

export default Vendordetails;
