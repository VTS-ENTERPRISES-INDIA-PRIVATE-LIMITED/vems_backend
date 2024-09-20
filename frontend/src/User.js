import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './user.css'; // Import the CSS file

const User = () => {
    const [data, setData] = useState([]);
    const [editingVendor, setEditingVendor] = useState(null);
    const [editForm, setEditForm] = useState({
        ContactNumber: '',
        Email: '',
        Address: '',
        AccountHandlerName: '',
        AccountNumber: '',
        BankName: '',
        BranchName: '',
        IFSCCode: '',
        AgreementStartDate: '',
        AgreementEndDate: '',
        AgreementAmount: '',
        AadharCardUpload: null,
        AgreementUpload: null
    });
    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user');  // Update endpoint if needed
                if (response && response.data) {
                    setData(response.data.data);  // Set the data in state
                } else {
                    alert('Unexpected response format');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Failed to fetch data');
            }
        };

        fetchData();
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleEdit = (VendorName) => {
        const vendor = data.find(v => v.VendorName === VendorName);
        if (vendor) {
            setEditingVendor(VendorName);
            setEditForm({
                ContactNumber: vendor.ContactNumber,
                Email: vendor.Email,
                Address: vendor.Address,
                AccountHandlerName: vendor.AccountHandlerName,
                AccountNumber: vendor.AccountNumber,
                BankName: vendor.BankName,
                BranchName: vendor.BranchName,
                IFSCCode: vendor.IFSCCode,
                AgreementStartDate: vendor.AgreementStartDate,
                AgreementEndDate: vendor.AgreementEndDate,
                AgreementAmount: vendor.AgreementAmount,
                AadharCardUpload: null,
                AgreementUpload: null
            });
        }
    };

    const handleDelete = async (VendorName) => {
        try {
            const confirmation = window.confirm(`Are you sure you want to delete vendor: ${VendorName}?`);
            if (confirmation) {
                const response = await axios.delete(`http://localhost:8000/vendor/${VendorName}`);
                if (response.status === 200) {
                    alert('Vendor deleted successfully');
                    setData(data.filter(item => item.VendorName !== VendorName)); // Update the state
                } else {
                    alert('Failed to delete vendor');
                }
            }
        } catch (error) {
            console.error('Error deleting vendor:', error);
            alert('Failed to delete vendor');
        }
    };

    const handleView = (VendorName) => {
        navigate(`/Vendordetails/${VendorName}`);
    };

    const handleAddVendor = () => {
        navigate('/login'); // Navigate to the add vendor page
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setEditForm(prevForm => ({
            ...prevForm,
            [name]: files[0] || null
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            for (const key in editForm) {
                formData.append(key, editForm[key]);
            }
            const response = await axios.put(`http://localhost:8000/vendor/${editingVendor}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status === 200) {
                alert('Vendor updated successfully');
                setEditingVendor(null);
                setEditForm({
                    ContactNumber: '',
                    Email: '',
                    Address: '',
                    AccountHandlerName: '',
                    AccountNumber: '',
                    BankName: '',
                    BranchName: '',
                    IFSCCode: '',
                    AgreementStartDate: '',
                    AgreementEndDate: '',
                    AgreementAmount: '',
                    AadharCardUpload: null,
                    AgreementUpload: null
                });
                // Refetch data to update the list
                const fetchData = async () => {
                    try {
                        const response = await axios.get('http://localhost:8000/user');
                        if (response && response.data) {
                            setData(response.data.data);
                        } else {
                            alert('Unexpected response format');
                        }
                    } catch (error) {
                        console.error('Error fetching data:', error);
                        alert('Failed to fetch data');
                    }
                };
                fetchData();
            } else {
                alert('Failed to update vendor');
            }
        } catch (error) {
            console.error('Error updating vendor:', error);
            alert('Failed to update vendor');
        }
    };

    return (
        <div className="show-data-container">
            <h2>Registered Vendors</h2>
            <div className="button-container">
                <button className="add-vendor-button" onClick={handleAddVendor}>Add Vendor</button>
            </div>
            {editingVendor ? (
                <div className="edit-form-container">
                    <h3>Edit Vendor</h3>
                    <form onSubmit={handleEditSubmit}>
                        <label>
                            Contact Number:
                            <input type="text" name="ContactNumber" value={editForm.ContactNumber} onChange={handleChange} required />
                        </label>
                        <label>
                            Email:
                            <input type="Email" name="Email" value={editForm.Email} onChange={handleChange} required />
                        </label>
                        <label>
                            Address:
                            <input type="text" name="Address" value={editForm.Address} onChange={handleChange} required />
                        </label>
                        <label>
                            Account Handler Name:
                            <input type="text" name="AccountHandlerName" value={editForm.AccountHandlerName} onChange={handleChange} />
                        </label>
                        <label>
                            Account Number:
                            <input type="text" name="AccountNumber" value={editForm.AccountNumber} onChange={handleChange} />
                        </label>
                        <label>
                            Bank Name:
                            <input type="text" name="BankName" value={editForm.BankName} onChange={handleChange} />
                        </label>
                        <label>
                            Branch Name:
                            <input type="text" name="BranchName" value={editForm.BranchName} onChange={handleChange} />
                        </label>
                        <label>
                            IFSC Code:
                            <input type="text" name="IFSCCode" value={editForm.IFSCCode} onChange={handleChange} />
                        </label>
                        <label>
                            Agreement Start Date:
                            <input type="date" name="AgreementStartDate" value={editForm.AgreementStartDate} onChange={handleChange} />
                        </label>
                        <label>
                            Agreement End Date:
                            <input type="date" name="AgreementEndDate" value={editForm.AgreementEndDate} onChange={handleChange} />
                        </label>
                        <label>
                            Agreement Amount:
                            <input type="number" name="AgreementAmount" value={editForm.AgreementAmount} onChange={handleChange} />
                        </label>
                        <label>
                            Aadhar Card Upload:
                            <input type="file" name="AadharCardUpload" onChange={handleFileChange} />
                        </label>
                        <label>
                            Agreement Upload:
                            <input type="file" name="AgreementUpload" onChange={handleFileChange} />
                        </label>
                        <button type="submit">Update Vendor</button>
                    </form>
                    <button onClick={() => setEditingVendor(null)}>Cancel</button>
                </div>
            ) : (
                <>
                    {data.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Vendor Name</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                    <th>View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.VendorName}>
                                        <td>{item.VendorName}</td>
                                        <td>{item.Email}</td>
                                        <td>
                                            <button className="action-button" onClick={() => handleEdit(item.VendorName)}>Edit</button>
                                            <button className="action-button" onClick={() => handleDelete(item.VendorName)}>Delete</button>
                                        </td>
                                        <td>
                                            <button className="action-button" onClick={() => handleView(item.VendorName)}>View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No vendors available.</p> // Handle the case when no data is available
                    )}
                </>
            )}
        </div>
    );
};

export default User;
