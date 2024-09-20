const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


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
app.get('/vendor/:id', (req, res) => {
    const vendorId = req.params.id;
    const sql = "SELECT * FROM vendor WHERE VendorName = ?";
    
    con.query(sql, [vendorId], (err, result) => {
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


app.post('/register', upload.fields([
    { name: 'AadharCardUpload', maxCount: 1 },
    { name: 'AgreementUpload', maxCount: 1 },
]), (req, res) => {
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
            AgreementAmount
        } = req.body;

        const AadharCardUpload = req.files['AadharCardUpload'] ? req.files['AadharCardUpload'][0].filename : null;
        const AgreementUpload = req.files['AgreementUpload'] ? req.files['AgreementUpload'][0].filename : null;

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


app.put('/vendor/:VendorName', upload.fields([
    { name: 'AadharCardUpload', maxCount: 1 },
    { name: 'AgreementUpload', maxCount: 1 }
]), (req, res) => {
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
        AgreementAmount
    } = req.body;

    const AadharCardUpload = req.files['AadharCardUpload'] ? req.files['AadharCardUpload'][0].filename : null;
    const AgreementUpload = req.files['AgreementUpload'] ? req.files['AgreementUpload'][0].filename : null;

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

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
