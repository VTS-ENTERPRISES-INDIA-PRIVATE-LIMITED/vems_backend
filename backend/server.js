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

app.post('/add-vehicle', (req, res) => {
    console.log('Request body:', req.body);

    const { VehicleName, VehicleType, VehicleNumber, VendorName,  InsuranceNumber, Mileage, YearOfManufacturing, FuelType, SeatCapacity, VehicleImage } = req.body;

    // if (!vehicleDetails) {
    //     return res.status(400).json({ error: 'vehicleDetails is missing from the request body' });
    // }

    const query = `INSERT INTO Vehicle_Details1 (VehicleName, VehicleType, VehicleNumber, VendorName,  InsuranceNumber, Mileage, YearOfManufacturing, FuelType, SeatCapacity, VehicleImage) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    con.query(query, [
        VehicleName, VehicleType, VehicleNumber, VendorName,  InsuranceNumber, Mileage, YearOfManufacturing, FuelType, SeatCapacity, VehicleImage
       
    ], (err, result) => {
        if (err) {
            console.log(err);
            console.error('Error inserting vehicle:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Vehicle added successfully', vehicleId: result.insertId });
    });
});


// app.post('/import-vehicles', upload.single('file'), (req, res) => {
//     console.log(req.file); 
//     if (!req.file) {
//         return res.status(400).json({ error: 'No file uploaded' });
//     }
//     const filePath = req.file.path;
    
//     try {
//         const workbook = xlsx.readFile(filePath);
//         const sheetName = workbook.SheetNames[0];
//         const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//         const query = `INSERT INTO Vehicle_Details1 (VehicleName, VehicleType, VehicleNumber, VendorName, InsuranceNumber, Mileage, YearOfManufacturing, FuelType, SeatCapacity, VehicleImage) 
//                        VALUES ?`;

//         const values = sheetData.map(row => [
//             row.VehicleName, 
//             row.VehicleType, 
//             row.VehicleNumber, 
//             row.VendorName,
//             row.InsuranceNumber,
//             row.Mileage,
//             row.YearOfManufacturing, 
//             row.FuelType, 
//             row.SeatCapacity, 
//             row.VehicleImage,
//         ]);

//         con.query(query, [values], (err, result) => {
//             fs.unlink(filePath, (unlinkErr) => {
//                 if (unlinkErr) {
//                     console.error('Error deleting file:', unlinkErr);
//                 }
//             });

//             if (err) {
//                 console.error('Error importing vehicles:', err);
//                 return res.status(500).json({ error: 'Database error' });
//             }
//             res.status(201).json({ message: 'Vehicles imported successfully', insertedRows: result.affectedRows });
//         });
//     } catch (error) {
//         console.error('Error reading file:', error);
//         return res.status(500).json({ error: 'File processing error' });
//     }
// });




app.get('/vehicles', (req, res) => {
    const query = "SELECT * FROM Vehicle_Details1";
    // const query  = `SELECT v., d. FROM Vehicle_Details v LEFT JOIN driver_details d ON v.vehicleId = d.vehicleId `;
    con.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving vehicles:', err);
            return res.status(500).json({ error: 'Database error' });
        }
       
        res.status(200).json(results);

    });
});


app.get('/vehicles/:vehicleId', (req, res) => {
    const vehicleId = req.params.vehicleId;

    const query = `SELECT v., d. FROM Vehicle_Details1 v LEFT JOIN driver_details d ON v.vehicleId = d.vehicleId WHERE v.vehicleId = ? `
    
    con.query(query, [vehicleId], (err, result) => {
        if (err) {
            console.error('Error fetching vehicle details:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.status(200).json(result[0]); 
    });
});

app.delete('/vehicles/:vehicleId', (req, res) => {
    const { vehicleId } = req.params;

    const query = "DELETE FROM Vehicle_Details1 WHERE vehicleId = ?";

    con.query(query, [vehicleId], (err, result) => {
        if (err) {
            console.error('Error deleting vehicle:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        res.status(200).json({ message: 'Vehicle deleted successfully' });
    });
});


app.put('/vehicles/:vehicleId', (req, res) => {
    const { vehicleId } = req.params;

    const {
        VehicleName,
        VehicleType,
        VehicleNumber,
        VendorName,
        InsuranceNumber,
        Mileage,
        YearOfManufacturing,
        FuelType,
        SeatCapacity,
        VehicleImage
    } = req.body;

    const query = `UPDATE Vehicle_Details1 SET 
                    VehicleName = ?, 
                    VehicleType = ?, 
                    VehicleNumber = ?, 
                    VendorName = ?, 
                    InsuranceNumber = ?, 
                    Mileage = ?, 
                    YearOfManufacturing = ?, 
                    FuelType = ?, 
                    SeatCapacity = ?, 
                    VehicleImage = ? 
                   WHERE vehicleId = ?`;

    con.query(query, [
        VehicleName,
        VehicleType,
        VehicleNumber,
        VendorName,
        InsuranceNumber,
        Mileage,
        YearOfManufacturing,
        FuelType,
        SeatCapacity,
        VehicleImage,
        vehicleId
    ], (err, result) => {
        if (err) {
            console.error('Error updating vehicle:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        res.status(200).json({ message: 'Vehicle updated successfully' });
    });
});


app.post('/trips/book/:EmployeeId', (req, res) => {
    const { EmployeeId } = req.params; 
    const { date, shift, trip_type } = req.body;

    const employeeQuery = "SELECT EmployeeName, Address, latitude, longitude FROM employeedetails WHERE EmployeeId = ?";
    con.query(employeeQuery, [EmployeeId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length === 0) return res.status(404).json({ error: 'Employee not found' });

        const { EmployeeName, Address, latitude, longitude } = result[0];
        const tripQuery = `INSERT INTO trips (EmployeeId, EmployeeName, Address, latitude, longitude, date, shift, trip_type) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        con.query(tripQuery, [EmployeeId, EmployeeName, Address, latitude, longitude, date, shift, trip_type], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Trip booked successfully', data: result });
        });
    });
});




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
            AadharCardUpload, 
            AgreementUpload    
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
        AadharCardUpload, 
        AgreementUpload    
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




app.post("/addDriver", (req, res) => {
    console.log('Request body:', req.body);

    const { DriverName, VendorName, Contact, Email, Gender, DOB, Address, Experience, Aadhar, Pan, LicenceNumber, ProfilePic } = req.body;

    const query = `
        INSERT INTO Driver_Details1 
        (DriverName, VendorName, Contact, Email, Gender, DOB, Address, Experience, Aadhar, Pan, LicenceNumber, ProfilePic) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;

    con.query(query, [DriverName, VendorName, Contact, Email, Gender, DOB, Address, Experience, Aadhar, Pan, LicenceNumber, ProfilePic], (err, result) => {
        if (err) {
            console.error('Error inserting driver:', err);
            // Early return to prevent further code execution
            return res.status(500).json({ message: "Error in adding driver" });
        }
        res.status(201).json({ message: 'Driver added successfully', driverId: result.insertId });
    });
});

// POST API to add driver details from excel
// app.post('/import-drivers', upload.single('file'), (req, res) => {
//     const filePath = req.file.path;
//     const workbook = xlsx.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     const query = `INSERT INTO Driver_Details1 (DriverName,VendorName, Contact, Email, Gender, DOB, Address, Experience, Aadhar, Pan, LicenceNumber, ProfilePic) 
//                     VALUES ?`;

//     const values = sheetData.map(row => [
//         row.DriverName, 
//         row.VendorName,
//         row.Contact,
//         row.Email, 
//         row.gender,
//         row.DOB, 
//         row.Address, 
//         row.Experience,
//         row.aadhar, 
//         row.Pan, 
//         row.licenceNumber,
//         row.profilePic
//     ]);

//     con.query(query, [values], (err, result) => {
       
//         fs.unlink(filePath, (unlinkErr) => {
//             if (unlinkErr) {
//                 console.error('Error deleting file:', unlinkErr);
//             }
//         });

//         if (err) {
//             console.error('Error importing Driver data:', err);
//             return res.status(500).json({ error: 'Database error' });
//         }
//         res.status(201).json({ message: 'Drivers Data imported successfully', insertedRows: result.affectedRows });
//     });
// });


// GET API to retrieve a list of drivers
app.get('/drivers', (req, res) => {
    const query = 'SELECT * FROM Driver_Details1';
   
    con.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving driverss:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});


// Get vehicle details by driverId
app.get('/drivers:driverId', (req, res) => {
    const driverId = req.params.driverId;

    const query = `SELECT 
            d.*,  
            v.* 
        FROM 
            Driver_Details1 d
        LEFT JOIN 
            Vehicle_Details v ON d.vehicleId = v.vehicleId 
        WHERE 
            d.driverId = ?`;
    
    con.query(query, [driverId], (err, result) => {
        if (err) {
            console.error('Error fetching driver details:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        res.status(200).json(result[0]); // Returning the first (and only) object
    });
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
