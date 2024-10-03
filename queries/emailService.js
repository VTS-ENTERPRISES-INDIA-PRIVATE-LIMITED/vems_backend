const moment = require('moment/moment');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	auth: {
		user: process.env.MAIL_ID,
		pass: process.env.MAIL_PASSWORD,
	},
});

const sendMail = async (toEmail, subject, htmlContent) => {
	const info = await transporter.sendMail({
		from: process.env.MAIL_ID,
		to: toEmail,
		subject: subject,
		html: htmlContent
	});
	return info.messageId;
}

const sendEmployeeEmail = (employeeData) => {
	return new Promise(async (resolve, reject) => {
		const mailOptions = {
			from: process.env.MAIL_ID,
			to: employeeData.EmployeeEmail,
			subject: "Registration Confirmation - Account Details",
			html: `
			<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
				<div style="max-width: 700px; margin: 40px auto; background-color: #5bb450">
				  <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
					<div style="background-color: #5bb450; padding: 20px; border-radius: 8px 8px 0 0;">
					  <h1 style="color: #ffffff; margin: 0; font-size: 24px;text-align: center; font-weight: bold">Registration Confirmation</h1>
					</div>
					<div style="padding: 20px; color: #333333; text-align: left;">
					  <p style="line-height: 1.6;">Dear ${employeeData.EmployeeName},</p>
					  <p style="line-height: 1.6;">We are pleased to inform you that your employee details have been successfully updated in our records.</p>
					  <p style="line-height: 1.6;">Here are your account details:</p>
					  <p style="line-height: 1.6; margin: 0;"><strong>Employee ID:</strong> ${employeeData.EmployeeId}</p>
					  <p style="line-height: 1.6; margin: 0;"><strong>Password:</strong> ${employeeData.EmployeePassword}</p>
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
			</body>
			`,
		};

		await transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				reject(error);
			} else {
				resolve(info.response);
			}
		});
	});
};

const sendDriverEmail = (driverData) => {
	return new Promise(async (resolve, reject) => {
		const mailOptions = {
			from: process.env.MAIL_ID,
			to: driverData.Email,
			subject: 'Registration Confirmation - Account Details',
			html: `<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px;">
				<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 10px;">
					<div style="padding: 20px; background: linear-gradient(to right, #007bff, #00d4ff); text-align: center; border-radius: 15px;">
						<h2 style="color: #ffffff;">Driver User ID and Login Credentials</h2>
					</div>
					<div style="padding: 20px;">
						<p>Dear ${driverData.DriverName},</p>
						<p>Your login credentials for accessing your driver dashboard are provided below:</p>
						<p><strong>Email:</strong> ${driverData.Email}</p>
						<p><strong>Password:</strong> ${driverData.Password}</p>
						<p>Please click the button below to log in to your account:</p>
						<a href="[Login Link]" style="background-color: #007bff; color: #ffffff; padding: 12px 25px; text-decoration: none;">Login Now</a>
					</div>
					<div style="text-align: center; padding: 20px; color: #aaaaaa;">
						<p>Thank you, VTS Support Team</p>
					</div>
				</div>
			</body>`
		};

		await transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				reject(error);
			} else {
				resolve(info.response);
			}
		});
	});
};

const calculatePickupTime = (loginTime, cumulativeTravelTime) => {
	const inMoment = moment(loginTime, 'HH:mm');
	const pickupTimeMoment = inMoment.subtract(cumulativeTravelTime, 'minutes');
	return pickupTimeMoment.format('h:mm A');
};

const sendConfirmationMail = async (employeeId, driverName, cabNumber, email, loginTime, cumulativeTravelTime) => {
	const calculatedPickupTime = calculatePickupTime(loginTime, cumulativeTravelTime);

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
					<p style="line-height: 1.6;">Dear ${employeeId},</p>
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
		const info = await transporter.sendMail(mailOptions);
		console.log('Email sent:', info.response);
		return { success: true };
	} catch (error) {
		console.error('Error sending email:', error);
		return { success: false, message: 'Error sending email: ' + error.message };
	}
};

module.exports = {
	sendMail,
	sendEmployeeEmail,
	sendDriverEmail,
	sendConfirmationMail
};
