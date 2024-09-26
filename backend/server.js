const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const moment = require('moment');


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

const transporter1 = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'viharikha790@gmail.com', // Your email
      pass: 'xujj gnfc abex iyvo', // Your email password
    },
  });
  
  // Function to calculate pickup time
  const calculatePickupTime = (in_time, cumulativeTravelTime) => {
    const inMoment = moment(in_time, 'HH:mm'); 
    const pickupTimeMoment = inMoment.subtract(cumulativeTravelTime, 'minutes'); 
    return pickupTimeMoment.format('h:mm A'); 
  };
  
  // Function to send confirmation email
  const sendConfirmationMail = async (employeeName, driverName, cabNumber, email, in_time, cumulativeTravelTime) => {
    const calculatedPickupTime = calculatePickupTime(in_time, cumulativeTravelTime);
  
    const mailOptions = {
      from: 'viharikha790@gmail.com', // Use your email
      to: email,
      subject: 'Confirmation of Cab Details',
      html: `<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
          <div style="max-width: 700px; margin: 40px auto; background-color: #5bb450">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #5bb450; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;text-align: center; font-weight: bold">Confirmation</h1>
              </div>
              <div style="padding: 20px; color: #333333; text-align: left;">
                <p style="line-height: 1.6;">Dear ${employeeName},</p>
                <p style="line-height: 1.6;">I hope this message finds you well.</p>
                <p style="line-height: 1.6;">I wanted to confirm the details for your cab ride as follows:</p>
                <p style="line-height: 1.6; margin: 0;">Cab Number: ${cabNumber}</p>
                <p style="line-height: 1.6; margin: 0;">Driver Name: ${driverName}</p>
                <p style="line-height: 1.6; margin: 0;">Pickup Time: ${calculatedPickupTime}</p>
                <p style="line-height: 1.6; margin-top: 20px;">Please let me know if you have any questions or if there are any changes needed.</p>
                <p style="line-height: 1.6;">Best regards,</p>
                <p style="line-height: 1.0;"><strong>VTS Support Team</strong></p>
                <p style="line-height: 1.0;">Contact No: 73050 96468</p>
                <p style="line-height: 1.0;">Email ID: support@vtsenterprisesindia.com</p>
              </div>
              <div style="padding: 20px; text-align: center; color: #aaaaaa; font-size: 12px;">
                <p>&copy; Copyright VTS Enterprises India Private Ltd, 2016</p>
              </div>
            </div>
          </div>
        </body>`, // Your existing HTML email content
    };
  
    try {
      const info = await transporter1.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, message: 'Error sending email: ' + error.message };
    }
  };
  
  // Endpoint to send emails and truncate the table
  app.post('/send-emails', async (req, res) => {
    const query = `
      SELECT 
        p.employee_name AS employeeName, 
        p.VehicleNumber, 
        e.employeeEmail, 
        p.in_time, 
        p.CumulativeTravelTime 
      FROM 
        ride_data p
      JOIN 
        modified_employee_data e 
      ON 
        p.employee_name = e.employeeName
    `;
  
    con.query(query, async (err, results) => {
      if (err) {
        console.error('Error fetching data from MySQL:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'No users found to send emails to.' });
      }
  
      const newlyAllocatedEmployees = results.filter(user => user.CumulativeTravelTime > 0);
      
      if (newlyAllocatedEmployees.length === 0) {
        return res.status(404).json({ success: false, message: 'No newly allocated users found.' });
      }
  
      for (const user of newlyAllocatedEmployees) {
        const { employeeName, VehicleNumber: cabNumber, employeeEmail: email, in_time, CumulativeTravelTime: cumulativeTravelTime } = user;
  
        const resultMail = await sendConfirmationMail(employeeName, employeeName, cabNumber, email, in_time, cumulativeTravelTime);
  
        if (!resultMail.success) {
          console.log(`Failed to send email to ${employeeName}: ${resultMail.message}`);
          return res.status(500).json({ success: false, message: `Failed to send email to ${employeeName}` });
        }
      }
  
      // Truncate the ride_data table after sending all emails
      con.query('TRUNCATE TABLE ride_data', (truncateErr) => {
        if (truncateErr) {
          console.error('Error truncating table:', truncateErr);
          return res.status(500).json({ success: false, message: 'Error truncating table' });
        }
        console.log('Table truncated successfully');
        res.json({ success: true, message: 'Emails sent and table truncated successfully.' });
      });
    });
  });



app.post('/add-vehicle', (req, res) => {
    console.log('Request body:', req.body);

    const { VehicleName, VehicleType, VehicleNumber, VendorName,  InsuranceNumber, Mileage, YearOfManufacturing, FuelType, SeatCapacity, VehicleImage } = req.body;

    

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
    
    const { DriverName, VendorName, Contact, Email, Gender, DOB, Address, Experience, Aadhar, Pan, LicenceNumber, ProfilePic} = req.body;
    const Password = crypto.randomBytes(7).toString('hex');
    const query = `
        INSERT INTO Driver_Details1 
        (DriverName, VendorName, Contact, Email, Gender, DOB, Address, Experience, Aadhar, Pan, LicenceNumber, ProfilePic,Password) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    con.query(query, [DriverName, VendorName, Contact, Email, Gender, DOB, Address, Experience, Aadhar, Pan, LicenceNumber, ProfilePic,Password], (err, result) => {
        if (err) {
            console.error('Error inserting driver:', err);
            // Early return to prevent further code execution
            return res.status(500).json({ message: "Error in adding driver" });
        }
        res.status(201).json({ message: 'Driver added successfully',  });
    });
    const mailOptions = {
        from: 'viharikha790@gmail.com',
        to: Email,
        subject: 'Registration Confirmation - Account Details',
        html:`<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
       <div style="padding: 20px; background: linear-gradient(to right, #007bff, #00d4ff); text-align: center; border-radius: 15px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <!-- Logo Section -->
            <div style="display: inline-block; vertical-align: middle; margin-right: 15px;">
                <img src="https://res.cloudinary.com/dalzs7bc2/image/upload/v1725259921/logo_ksostb.png" alt="Company Logo" style="max-width: 80px; border-radius: 10px; background-color: #ffffff; padding: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);">
            </div>
            <!-- Company Name and Tagline Section -->
            <div style="display: inline-block; vertical-align: middle; text-align: left;">
                <p style="font-size: 26px; color: #ffffff; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                    VTS Transport
                </p>
                <p style="font-size: 14px; color: #f0f0f0; margin: 5px 0 0 0;">
                    Seamless & Secure Journey
                </p>
            </div>
        </div>
        <!-- Content Section -->
        <h2 style="text-align: center; padding: 20px 0; color: #333;">Driver User ID and Login Credentials</h2>
        <div style="margin: 20px 0; padding: 0 20px;">
            <p style="font-size: 16px; line-height: 1.8;">Dear ${DriverName},</p>
            <p style="font-size: 16px; line-height: 1.8;">Your login credentials for accessing your driver dashboard are provided below:</p>
            <p style="font-size: 16px; line-height: 1.8;color:black;"><strong>Email:</strong> ${Email}</p>
            <p style="font-size: 16px; line-height: 1.8;"><strong>Password:</strong><br> ${Password}</p>
            <p style="font-size: 16px; line-height: 1.8;">Please click the button below to log in to your account:</p>
            <!-- Login Now Button -->
            <p style="text-align: center;">
                <a href="[Login Link]" target="_blank" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: background-color 0.3s ease;">
                    Login Now
                </a>
            </p>
            <p style="font-size: 16px; line-height: 1.8;">If you have any questions or issues, please feel free to contact the support team.</p>
        </div>
        <!-- Footer Section -->
        <div style="margin-top: 30px; padding: 20px; font-size: 14px; color: #777; text-align: center;">
            <p>Thank you,</p>
            <p>VTS Support Team</p>
            <p><a href="mailto:hr@vtshrteam.com" style="color: #007bff; text-decoration: none;">hr@vtshrteam.com</a> | +91 9141725777</p>
        </div>
    </div>
</body>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending Email:', error);
            res.status(500).send('Error sending Email');
        } else {
            console.log('Email sent:', info.response);
            res.send('Employee added successfully and Email sent');
        }
        console.log(EmployeeId, EmployeeEmail);
    });
});

const upload = multer({ dest: 'uploads/' });

//POST API to add driver details from excel
app.post('/import-drivers', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const query = `INSERT INTO Driver_Details1 (DriverName,VendorName, Contact, Email, Gender, DOB, Address, Experience, Aadhar, Pan, LicenceNumber, ProfilePic) 
                    VALUES ?`;

    const values = sheetData.map(row => [
        row.DriverName, 
        row.VendorName,
        row.Contact,
        row.Email, 
        row.gender,
        row.DOB, 
        row.Address, 
        row.Experience,
        row.aadhar, 
        row.Pan, 
        row.licenceNumber,
        row.profilePic
    ]);

    con.query(query, [values], (err, result) => {
       
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error('Error deleting file:', unlinkErr);
            }
        });

        if (err) {
            console.error('Error importing Driver data:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Drivers Data imported successfully', insertedRows: result.affectedRows });
    });
});


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



// Function to generate random password
const generateRandomPassword = (length = 6) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
  port: 587,
  secure: false,
    auth: {
        user: 'viharikha790@gmail.com',
        pass: 'xujj gnfc abex iyvo',
    },
});









// upload Excel file and add employee data
app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = path.join(uploadsDir, req.file.filename);
    
    const workbook = xlsx.readFile(filePath);
    const sheet_name = workbook.SheetNames[0];
    const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name]);

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS EmployeeDetails (
            EmployeeId VARCHAR(100) PRIMARY KEY, 
            EmployeeName VARCHAR(200), 
            EmployeeGender VARCHAR(20), 
            EmployeeAddress VARCHAR(255),  
            EmployeeCity VARCHAR(100), 
            EmployeeLatitude VARCHAR(100), 
            EmployeeLongitude VARCHAR(100), 
            EmployeeEmail VARCHAR(100), 
            EmployeeContact VARCHAR(20), 
            EmployeeEmergencyContact VARCHAR(20), 
            EmployeePassword VARCHAR(100),
            EmployeeImage VARCHAR(255)
        );
    `;

    con.query(createTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Table created or already exists.');
    });

    // Insert data into the table immediately
    sheet.forEach(row => {
        const EmployeePassword = generateRandomPassword();
        const query = `
            INSERT INTO EmployeeDetails 
            (EmployeeId, EmployeeName, EmployeeGender, EmployeeAddress, EmployeeCity, EmployeeLatitude, EmployeeLongitude, EmployeeEmail, EmployeeContact, EmployeeEmergencyContact, EmployeePassword, EmployeeImage) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            EmployeeName = VALUES(EmployeeName),
            EmployeeGender = VALUES(EmployeeGender),
            EmployeeAddress = VALUES(EmployeeAddress),
            EmployeeCity = VALUES(EmployeeCity),
            EmployeeLatitude = VALUES(EmployeeLatitude),
            EmployeeLongitude = VALUES(EmployeeLongitude),
            EmployeeEmail = VALUES(EmployeeEmail),
            EmployeeContact = VALUES(EmployeeContact),
            EmployeeEmergencyContact = VALUES(EmployeeEmergencyContact),
            EmployeePassword = VALUES(EmployeePassword),
            EmployeeImage = VALUES(EmployeeImage)
        `;

        const values = [
            row.EmployeeId,
            row.EmployeeName,
            row.EmployeeGender,
            row.EmployeeAddress,
            row.EmployeeCity,
            row.EmployeeLatitude,
            row.EmployeeLongitude,
            row.EmployeeEmail,
            row.EmployeeContact,
            row.EmployeeEmergencyContact,
            EmployeePassword,
            row.EmployeeImage
        ];

        con.query(query, values, (err, result) => {
            if (err) {
                console.error('Error inserting data into MySQL:', err);
            } else {
                console.log('Data inserted/updated successfully.');
            }
        });

        // Store the password in the row for later use in the email
        row.EmployeePassword = EmployeePassword;
    });

    // Send response to frontend after data is inserted
    res.send('File uploaded and mails are being processed.');

    // Now process the emails using async queue
    const emailQueue = async.queue((row, callback) => {
        const mailOptions = {
            from: 'harshit995905@gmail.com',
            to: row.EmployeeEmail,
            subject: 'Registration Confirmation - Account Details',
            html:`<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                            <div style="max-width: 700px; margin: 40px auto; background-color: #5bb450">
                                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                    
                                    <div style="background-color: #5bb450; padding: 20px; border-radius: 8px 8px 0 0;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;text-align: center; font-weight: bold">Registration Confirmation</h1>
                                    </div>
                                    
                                    <div style="padding: 20px; color: #333333; text-align: left;">
                                        <p style="line-height: 1.6;">Dear ${row.EmployeeName},</p>
                                        <p style="line-height: 1.6;">We are pleased to inform you that your employee details have been successfully updated in our records.</p>
                                        <p style="line-height: 1.6;">Here are your account details:</p>
                                        <p style="line-height: 1.6; margin: 0;"><strong>Employee ID:</strong> ${row.EmployeeId}</p>
                                        <p style="line-height: 1.6; margin: 0;"><strong>Password:</strong> ${row.EmployeePassword}</p>
                                        <p style="line-height: 1.6; margin-top: 20px;">Please ensure to change your password after logging in for the first time.</p>
                                        <p style="line-height: 1.6;">Best regards,</p>
                                        <p style="line-height: 1.0;"><strong>VEMS Support Team</strong></P>
                                        <p style="line-height: 1.0;">Contact No: 74166 33125</p>
                                        <p style="line-height: 1.0;">Email ID: vems-support@gmail.com</p>
                                    </div>
                                    
                                    <div style="padding: 20px; text-align: center; color: #aaaaaa; font-size: 12px;">
                                    <p>&copy; Copyright VTS Enterprises India Private Ltd, 2016</p>
                                    </div>
                                    
                                </div>
                            </div>
                        </body>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending Email:', error);
                callback(error);
            } else {
                console.log('Email sent:', info.response);
                callback();
            }
        });
    }, 1); // Process one email at a time (throttling)

    // Add emails to the queue
    sheet.forEach(row => {
        emailQueue.push(row, (err) => {
            if (err) {
                console.error('Error processing email for:', row.EmployeeId, row.EmployeeEmail, err);
            } else {
                console.log('Email processed for:',  row.EmployeeId, row.EmployeeEmail);
            }
        });
    });

    // When all emails are sent, delete the file
    emailQueue.drain(() => {
        console.log('All emails have been sent.');
        
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
            } else {
                console.log('Uploaded file deleted.');
            }
        });
    });
});


app.post('/add-employee', (req, res) => {
    const {
        EmployeeImage,
        EmployeeId,
        EmployeeName,
        EmployeeGender,
        EmployeeAddress,
        EmployeeCity,
        EmployeeLatitude,
        EmployeeLongitude,
        EmployeeEmail,
        EmployeeContact,
        EmployeeEmergencyContact
    } = req.body;

    console.log(req.body)
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS EmployeeDetails (
            EmployeeId VARCHAR(100) PRIMARY KEY, 
            EmployeeName VARCHAR(200), 
            EmployeeGender VARCHAR(20), 
            EmployeeAddress VARCHAR(255),  
            EmployeeCity VARCHAR(100), 
            EmployeeLatitude VARCHAR(100), 
            EmployeeLongitude VARCHAR(100), 
            EmployeeEmail VARCHAR(100), 
            EmployeeContact VARCHAR(20), 
            EmployeeEmergencyContact VARCHAR(20), 
            EmployeePassword VARCHAR(100),
            EmployeeImage VARCHAR(255)
        );
    `;

    con.query(createTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Table created or already exists.');
    });

    const EmployeePassword = generateRandomPassword();
            
            const query = `
                INSERT INTO EmployeeDetails 
                (EmployeeId, EmployeeName, EmployeeGender, EmployeeAddress, EmployeeCity, EmployeeLatitude, EmployeeLongitude, EmployeeEmail, EmployeeContact, EmployeeEmergencyContact, EmployeePassword, EmployeeImage) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                EmployeeName = VALUES(EmployeeName),
                EmployeeGender = VALUES(EmployeeGender),
                EmployeeAddress = VALUES(EmployeeAddress),
                EmployeeCity = VALUES(EmployeeCity),
                EmployeeLatitude = VALUES(EmployeeLatitude),
                EmployeeLongitude = VALUES(EmployeeLongitude),
                EmployeeEmail = VALUES(EmployeeEmail),
                EmployeeContact = VALUES(EmployeeContact),
                EmployeeEmergencyContact = VALUES(EmployeeEmergencyContact),
                EmployeePassword = VALUES(EmployeePassword),
                EmployeeImage = VALUES(EmployeeImage)
            `;

            const values = [
                EmployeeId,
                EmployeeName,
                EmployeeGender,
                EmployeeAddress,
                EmployeeCity,
                EmployeeLatitude,
                EmployeeLongitude,
                EmployeeEmail,
                EmployeeContact,
                EmployeeEmergencyContact,
                EmployeePassword,
                EmployeeImage
            ];

            con.query(query, values, (err, result) => {
                if (err) {
                    console.error('Error inserting data into MySQL:', err);
                    res.status(500).send('Error saving data');
                } else {
                    console.log('Data inserted/updated successfully.');

                    const mailOptions = {
                        from: 'viharikha790@gmail.com',
                        to: EmployeeEmail,
                        subject: 'Registration Confirmation - Account Details',
                        html:`<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                                <div style="max-width: 700px; margin: 40px auto; background-color: #5bb450">
                                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                        
                                        <div style="background-color: #5bb450; padding: 20px; border-radius: 8px 8px 0 0;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;text-align: center; font-weight: bold">Registration Confirmation</h1>
                                        </div>
                                        
                                        <div style="padding: 20px; color: #333333; text-align: left;">
                                            <p style="line-height: 1.6;">Dear ${EmployeeName},</p>
                                            <p style="line-height: 1.6;">We are pleased to inform you that your employee details have been successfully updated in our records.</p>
                                            <p style="line-height: 1.6;">Here are your account details:</p>
                                            <p style="line-height: 1.6; margin: 0;"><strong>Employee ID:</strong> ${EmployeeId}</p>
                                            <p style="line-height: 1.6; margin: 0;"><strong>Password:</strong> ${EmployeePassword}</p>
                                            <p style="line-height: 1.6; margin-top: 20px;">Please ensure to change your password after logging in for the first time.</p>
                                            <p style="line-height: 1.6;">Best regards,</p>
                                            <p style="line-height: 1.0;"><strong>VEMS Support Team</strong></P>
                                            <p style="line-height: 1.0;">Contact No: 74166 33125</p>
                                            <p style="line-height: 1.0;">Email ID: vems-support@gmail.com</p>
                                        </div>
                                        
                                        <div style="padding: 20px; text-align: center; color: #aaaaaa; font-size: 12px;">
                                        <p>&copy; Copyright VTS Enterprises India Private Ltd, 2016</p>
                                        </div>
                                        
                                    </div>
                                </div>
                            </body>`,
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error('Error sending Email:', error);
                            res.status(500).send('Error sending Email');
                        } else {
                            console.log('Email sent:', info.response);
                            res.send('Employee added successfully and Email sent');
                        }
                        console.log(EmployeeId, EmployeeEmail);
                    });
                }
            });
});

//update employee by id
app.post('/updateemployee/:empId', (req, res) => {
    const empId = req.params.empId;
    const { 
        EmployeeName, 
        EmployeeGender, 
        EmployeeAddress, 
        EmployeeCity, 
        EmployeeLatitude, 
        EmployeeLongitude, 
        EmployeeContact, 
        EmployeeEmergencyContact
    } = req.body;

        // If no image file is provided, update employee data without changing the image
        const query = `
            UPDATE EmployeeDetails 
            SET 
                EmployeeName = ?, 
                EmployeeGender = ?, 
                EmployeeAddress = ?, 
                EmployeeCity = ?, 
                EmployeeLatitude = ?, 
                EmployeeLongitude = ?, 
                EmployeeContact = ?, 
                EmployeeEmergencyContact = ?
            WHERE EmployeeId = ?
        `;

        const values = [
            EmployeeName, 
            EmployeeGender, 
            EmployeeAddress, 
            EmployeeCity, 
            EmployeeLatitude, 
            EmployeeLongitude, 
            EmployeeContact, 
            EmployeeEmergencyContact,
            empId
        ];

        con.query(query, values, (err, result) => {
            if (err) {
                console.error('Error updating employee details:', err);
                return res.status(500).send('Database update failed');
            }

            res.send({ message: 'Employee details updated successfully!' });
        });
});


app.post('/deleteemployee/:empId', (req, res) => {
    const empId = req.params.empId;
    const query = "DELETE FROM EmployeeDetails WHERE EmployeeId = ?";
    con.query(query, empId, (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Employee Deleted successfully!' });
    })
});


app.get('/showemployee', (req, res) => {
    const query = "SELECT * FROM EmployeeDetails";
    con.query(query, (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
    })
});
//show all trip request details
app.get('/showtrips', (req, res) => {
    const query = "SELECT * FROM CabBookingTable";
    db.query(query, (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
    })
});

const PORT = 8001;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});