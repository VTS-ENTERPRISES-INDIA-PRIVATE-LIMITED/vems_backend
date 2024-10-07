const express = require("express");
const router = express.Router();
const connection = require("../db");
const { sendMail } = require("./emailService");

const htmlTemplate = (AdminName, AdminMail, AdminPhoneNum) => `
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px;">
   <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">      
      <div style="padding: 20px; background: linear-gradient(to right, #007bff, #00d4ff); text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;">
         <div style="display: flex; align-items: center; justify-content: center;">
            <img src="https://res.cloudinary.com/dalzs7bc2/image/upload/v1725259921/logo_ksostb.png" alt="Company Logo" style="max-width: 80px; border-radius: 10px; background-color: #ffffff; padding: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); margin-right: 15px;">
            <h2 style="color: #fff; margin: 0; font-size: 24px; display: inline;">New Admin Registered</h2>
         </div>
      </div>

      <div style="padding: 20px;">
         <p style="font-size: 16px; line-height: 1.6;"><strong>Name:</strong> ${AdminName}</p>
         <p style="font-size: 16px; line-height: 1.6;">
            <strong>Email:</strong> <span style="word-wrap: break-word; overflow-wrap: break-word;">${AdminMail}</span> 
            <strong>Phone Number:</strong> ${AdminPhoneNum}
         </p> 
         <p style="font-size: 16px; line-height: 1.6;">Please review the registration:</p>
            
         <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.BACKEND_END_URL}/admin/accept?AdminMail=${AdminMail}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); transition: background-color 0.3s ease;">
               Accept
            </a>
            <a href="${process.env.BACKEND_END_URL}/admin/reject?AdminMail=${AdminMail}" style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); transition: background-color 0.3s ease;">
               Reject
            </a>
         </div>
      </div>

      <div style="margin-top: 30px; padding: 20px; font-size: 14px; color: #777; text-align: center; background-color: #f9f9f9; border-top: 1px solid #dddddd;">
         <p style="margin: 0;">Thank you,</p>
			<p style="margin: 5px 0 10px;">VTS Support Team</p>
         <p style="margin: 0;">
            <a href="mailto:hr@vtshrteam.com" style="color: #007bff; text-decoration: none;">hr@vtshrteam.com</a> | +91 9141725777
         </p>
      </div>
   </div>
</body>
`;
const acceptEmailTemplate = (AdminName, AdminMail, AdminPassword) => `
   <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
         <div style="padding: 20px; background: linear-gradient(to right, #28a745, #6fdc8a); text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;">
            <h2 style="color: #fff; margin: 0;">Congratulations!</h2>
         </div>
         <div style="padding: 20px;">
            <h3 style="font-size: 20px; margin: 0;">Hello ${AdminName},</h3>
            <p style="font-size: 16px; line-height: 1.6;">You have been accepted as an admin for the Admin Portal.</p>
            <p style="font-size: 16px; line-height: 1.6;">We are excited to have you on board!</p>
            <p style="font-size: 16px; line-height: 1.6;">Your Login Credentials are follows😍:</p>
            <p style="font-size: 16px; line-height: 1.6;"><strong>Email:</strong> ${AdminMail}</p>
            <p style="font-size: 16px; line-height: 1.6;"><strong>Password:</strong> ${AdminPassword}</p>
            <div style="margin-top: 20px; text-align: center;">
               <a href="${process.env.FRONTEND_END_URL}/login" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Access the Portal</a>
            </div>
         </div>
         <div style="padding: 20px; font-size: 14px; color: #777; text-align: center;">
            <p>Thank you,</p>
            <p>The Driver Portal Team</p>
         </div>
      </div>
   </body>
`;
const rejectEmailTemplate = (name) => `
   <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
         <div style="padding: 20px; background: linear-gradient(to right, #dc3545, #f4a6a8); text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;">
            <h2 style="color: #fff; margin: 0;">Application Update</h2>
         </div>
         <div style="padding: 20px;">
            <h3 style="font-size: 20px; margin: 0;">Hello ${name},</h3>
            <p style="font-size: 16px; line-height: 1.6;">Unfortunately, your request to become an admin for the Driver Portal has been rejected.</p>
            <p style="font-size: 16px; line-height: 1.6;">Thank you for your interest, and we wish you all the best in your future endeavors.</p>
            <div style="margin-top: 20px; text-align: center;">
               <a href="${process.env.FRONTEND_END_URL}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to Homepage</a>
            </div>
         </div>
         <div style="padding: 20px; font-size: 14px; color: #777; text-align: center;">
            <p>Thank you,</p>
            <p>The Driver Portal Team</p>
         </div>
      </div>
   </body>
`;

router.post('/register', (req, res) => {
   const { AdminName, AdminMail, AdminPhoneNum } = req.body;
   const randomPassword = Math.random().toString(36).slice(-8);

   const sql = `INSERT INTO AdminDetails (AdminName,AdminMail,AdminPhoneNum,AdminPassword) VALUES (?, ?, ?, ?)`;
   connection.query(sql, [AdminName, AdminMail, AdminPhoneNum, randomPassword], (err, results) => {
      if (err) {
         return res.status(500).send('Database error: ' + err);
      }

      sendMail(`${process.env.MAIL_ID}`, "New Admin Registered", htmlTemplate(AdminName, AdminMail, AdminPhoneNum))
         .then(messageId => res.status(200).send(`Email sent for review. ID: ${messageId}`))
         .catch(err => res.status(500).send('Error sending review email: ' + err));
   });
});

router.get('/accept', (req, res) => {
   const Admin = req.query.AdminMail;

   const sqlGetAdmin = `SELECT AdminName,AdminMail,AdminPassword FROM AdminDetails WHERE AdminMail = ?`;
   connection.query(sqlGetAdmin, [Admin], (err, results) => {
      if (err) {
         return res.status(500).send('Database error: ' + err);
      }

      if (results.length === 0) {
         return res.status(404).send('Admin not found');
      }

      const { AdminName, AdminMail, AdminPassword } = results[0];

      const sqlUpdateStatus = `UPDATE AdminDetails SET IsApproved = 1 WHERE AdminMail = ?`;
      connection.query(sqlUpdateStatus, [AdminMail], (err, updateResults) => {
         if (err) {
            return res.status(500).send('Database error: ' + err);
         }

         sendMail(AdminMail, "Admin Approval", acceptEmailTemplate(AdminName, AdminMail, AdminPassword))
            .then(messageId => {
               res.status(200).send(`
							<h2>Admin accepted successfully</h2>
							<p>An approval email has been sent to ${AdminMail}.</p>
						`);
            })
            .catch(err => {
               res.status(500).send('Error sending acceptance email: ' + err);
            });
      });
   });
});

router.get('/reject', (req, res) => {
   const AdminEmail = req.query.Admin;

   const sql = `UPDATE AdminDetails SET IsApproved = 0 WHERE AdminMail = ?`;
   connection.query(sql, [AdminEmail], (err, results) => {
      if (err) {
         return res.status(500).send('Database error: ' + err);
      }

      sendMail(AdminEmail, "Admin Rejection", rejectEmailTemplate(AdminName))
         .then(messageId => {
            res.status(200).send(`
						<h2>Admin rejected successfully</h2>
						<p>A rejection email has been sent to ${AdminEmail}.</p>
					`);
         })
         .catch(err => {
            res.status(500).send('Error sending rejection email: ' + err);
         });
   });
});

router.post('/login', (req, res) => {
   const { AdminEmail, AdminPassword } = req.body;

   const sql = `SELECT AdminId, AdminName, AdminMail, AdminPhoneNum, IsApproved FROM AdminDetails WHERE AdminMail = ? AND AdminPassword = ?`;

   connection.getConnection((err, connection) => {
      if (err) {
         return res.status(500).send('Database connection error: ' + err);
      }

      connection.query(sql, [AdminEmail, AdminPassword], (err, results) => {
         connection.release(); // Always release the connection back to the pool

         if (err) {
            return res.status(500).send('Database error: ' + err);
         }

         if (results.length === 0) {
            return res.status(401).send('Invalid email, password, or inactive account.');
         }

         const adminDetails = results[0];
         if (adminDetails.IsApproved === null || adminDetails.IsApproved === 0) {
            return res.status(401).send('Account not approved.');
         }

         // Create session and store user details
         req.session.isAuthenticated = true;
         req.session.admin = {
            AdminId: adminDetails.AdminId,
            AdminName: adminDetails.AdminName,
            AdminMail: adminDetails.AdminMail,
            AdminPhoneNum: adminDetails.AdminPhoneNum,
         };

         res.status(200).json({
            message: 'Login successful',
            admin: req.session.admin,
         });
      });
   });
});

router.post('/logout', (req, res) => {
   if (req.session) {
      req.session.destroy((err) => {
         if (err) {
            return res.status(500).send('Logout failed.');
         }
         return res.status(200).send('Logout successful.');
      });
   } else {
      res.status(400).send('No active session to log out.');
   }
});

module.exports = router;