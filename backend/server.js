const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'demo',
    port: 3307
});

con.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL!');
});

// Get all vendors
app.get('/user', (req, res) => {
    const sql = "SELECT * FROM vendor";
    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ message: "Failed to fetch data", error: err });
        }
        res.status(200).json({ data: result });
    });
});
app.get('/user/:VendorName', (req, res) => {
    const VendorName = req.params.VendorName;
    const sql = "SELECT * FROM vendor WHERE VendorName = ?";
    
    con.query(sql, [VendorName], (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ message: "Failed to fetch data", error: err });
        }
        if (result.length > 0) {
            res.status(200).json(result[0]); // Return the first (and only) result
        } else {
            res.status(404).json({ message: "Vendor not found" });
        }
    });
});

// Get vendor by name
app.get('/vendor/:id', (req, res) => {
    const vendorId = req.params.id;
    const sql = "SELECT * FROM vendor WHERE VendorName = ?";
    
    con.query(sql, [vendorId], (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ message: "Failed to fetch data", error: err });
        }
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: "Vendor not found" });
        }
    });
});

// Register a new vendor
app.post('/register', (req, res) => {
    try {
        const {
            VendorName,
            ContactNumber,
            Email,
            Address,
            AccountHandlerName,
            AccountNumber,
            BankName,
            BranchName,
            IFSCCode,
            AgreementStartDate,
            AgreementEndDate,
            AgreementAmount,
            AadharCardUpload, // Now as VARCHAR
            AgreementUpload    // Now as VARCHAR
        } = req.body;

        const sql = 'INSERT INTO vendor (VendorName, ContactNumber, Email, Address, AadharCardUpload, AgreementUpload, AccountHandlerName, AccountNumber, BankName, BranchName, IFSCCode, AgreementStartDate, AgreementEndDate, AgreementAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        con.query(sql, [
            VendorName, ContactNumber, Email, Address,
            AadharCardUpload, AgreementUpload,
            AccountHandlerName, AccountNumber, BankName, BranchName, IFSCCode,
            AgreementStartDate, AgreementEndDate, AgreementAmount
        ], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ message: "Failed to register vendor", error: err });
            }
            res.status(200).json({ message: "Vendor registered successfully", result });
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: "An unexpected error occurred", error });
    }
});

// Update vendor details
app.put('/vendor/:VendorName', (req, res) => {
    const VendorName = req.params.VendorName;
    const {
        ContactNumber,
        Email,
        Address,
        AccountHandlerName,
        AccountNumber,
        BankName,
        BranchName,
        IFSCCode,
        AgreementStartDate,
        AgreementEndDate,
        AgreementAmount,
        AadharCardUpload, // Now as VARCHAR
        AgreementUpload    // Now as VARCHAR
    } = req.body;

    const sql = `UPDATE vendor SET 
        ContactNumber = ?, Email = ?, Address = ?,
        AadharCardUpload = ?, AgreementUpload = ?,
        AccountHandlerName = ?, AccountNumber = ?, BankName = ?, BranchName = ?, IFSCCode = ?,
        AgreementStartDate = ?, AgreementEndDate = ?, AgreementAmount = ?
        WHERE VendorName = ?`;

    con.query(sql, [
        ContactNumber, Email, Address,
        AadharCardUpload, AgreementUpload,
        AccountHandlerName, AccountNumber, BankName, BranchName, IFSCCode,
        AgreementStartDate, AgreementEndDate, AgreementAmount,
        VendorName
    ], (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ message: "Failed to update vendor", error: err });
        }
        res.status(200).json({ message: "Vendor updated successfully" });
    });
});

// Delete vendor
app.delete('/vendor/:VendorName', (req, res) => {
    const VendorName = req.params.VendorName;

    const sql = "DELETE FROM vendor WHERE VendorName = ?";
    
    con.query(sql, [VendorName], (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
            return res.status(500).json({ message: "Failed to delete vendor", error: err });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Vendor deleted successfully" });
        } else {
            res.status(404).json({ message: "Vendor not found" });
        }
    });
});
app.get('/escorts', (req, res) => {
    const sql = "SELECT * FROM escort";
    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ message: "Failed to fetch data", error: err });
        }
        res.status(200).json({ data: result });
    });
});

app.get('/escorts/:id', (req, res) => {
    const vendorId = req.params.id;
    const sql = "SELECT * FROM escort WHERE EscortName = ?";
    
    con.query(sql, [vendorId], (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ message: "Failed to fetch data", error: err });
        }
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: "Vendor not found" });
        }
    });
});

app.put('/escorts/:EscortName', (req, res) => {
    const EscortName = req.params.EscortName;
    const {
        ContactNumber,
        Age,
        Address,
        AadharCardUpload,
        CertificationUpload,
        EscortProfilePicUpload,
        AccountHandlerName,
        AccountNumber,
        BankName,
        BranchName,
        IFSCCode,
        Shift
    } = req.body;

    const sql = `UPDATE escort SET 
        ContactNumber = ?, Age = ?, Address = ?,
        AadharCardUpload = ?, CertificationUpload = ?, EscortProfilePicUpload = ?,
        AccountHandlerName = ?, AccountNumber = ?, BankName = ?, BranchName = ?, IFSCCode = ?, Shift = ?
        WHERE EscortName = ?`;

    con.query(sql, [
        ContactNumber, Age, Address,
        AadharCardUpload, CertificationUpload, EscortProfilePicUpload,
        AccountHandlerName, AccountNumber, BankName, BranchName, IFSCCode, Shift,
        EscortName
    ], (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ message: "Failed to update escort", error: err });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Escort updated successfully" });
        } else {
            res.status(404).json({ message: "Escort not found" });
        }
    });
});

app.delete('/escorts/:EscortName', (req, res) => {
    const EscortName = req.params.EscortName;

    const sql = "DELETE FROM escort WHERE EscortName = ?";

    con.query(sql, [EscortName], (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
            return res.status(500).json({ message: "Failed to delete escort", error: err });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Escort deleted successfully" });
        } else {
            res.status(404).json({ message: "Escort not found" });
        }
    });
});

app.post('/register', (req, res) => {
    try {
        const {
            EscortName,
            ContactNumber,
            Age,
            Address,
            AadharCardUpload,
            CertificationUpload,
            EscortProfilePicUpload,
            AccountHandlerName,
            AccountNumber,
            BankName,
            BranchName,
            IFSCCode,
            Shift
        } = req.body;

        const sql = `INSERT INTO escort (EscortName, ContactNumber, Age, Address, AadharCardUpload, CertificationUpload, EscortProfilePicUpload, AccountHandlerName, AccountNumber, BankName, BranchName, IFSCCode, Shift) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        con.query(sql, [
            EscortName, ContactNumber, Age, Address, AadharCardUpload, CertificationUpload, EscortProfilePicUpload,
            AccountHandlerName, AccountNumber, BankName, BranchName, IFSCCode, Shift
        ], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ message: "Failed to register escort", error: err });
            }
            res.status(200).json({ message: "Escort registered successfully", result });
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: "An unexpected error occurred", error });
    }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
