const express = require('express');
const router = express.Router();
const connection = require('../db');
const { sendConfirmationMail } = require('./emailService');

(async () => {
	await connection.query(`
		CREATE TABLE IF NOT EXISTS rideallocation_Pickup(
			BookingId varchar(255) primary key,
			EmployeeId varchar(255),
			EmployeeName varchar(255),
			EmployeeGender varchar(255),
			EmployeeAddress varchar(255),
			EmployeeCity varchar(255),
			Latitude varchar(255),
			Longitude varchar(255),
			TripDate varchar(255),
			LoginTime varchar(255),
			LogoutTime varchar(255),
			VehicleId varchar(255),
			VehicleNumber varchar(255),
			VehicleSeatCapacity int,
			CumulativeTravelTime decimal(10,2),
			PriorityOrder int);
	`);
})();

router.post('/sendEmails', async (req, res) => {
	const query = `
	SELECT 
		p.EmployeeId, 
		p.DriverName,
		p.VehicleNumber, 
		p.EmployeeEmail, 
		p.LoginTime, 
		e.CumulativeTravelTime 
	FROM 
		CabAllocationML p
	JOIN 
		rideallocate_pickupdata e 
	ON 
		p.EmployeeId = e.EmployeeId
`;;

	connection.query(query, async (err, results) => {
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
			const { EmployeeId, DriverName, VehicleNumber, EmployeeEmail, LoginTime, CumulativeTravelTime } = user;

			const resultMail = await sendConfirmationMail(EmployeeId, DriverName, VehicleNumber, EmployeeEmail, LoginTime, CumulativeTravelTime);

			if (!resultMail.success) {
				console.log(`Failed to send email to ${EmployeeId}: ${resultMail.message}`);
				return res.status(500).json({ success: false, message: `Failed to send email to ${EmployeeId}` });
			} else {
				return res.status(200).json({message: "All mails Sent"})
			}
		}

		// Truncate the ride_data table after sending all emails
		connection.query('CREATE EVENT IF NOT EXISTS delete_data_evet ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 3 HOUR DO TRUNCATE TABLE CabAllocationML;', (truncateErr) => {
			if (truncateErr) {
				console.error('Error truncating table:', truncateErr);
				return res.status(500).json({ success: false, message: 'Error truncating table' });
			}
			console.log('Table truncated successfully');
			res.json({ success: true, message: 'Emails sent and table truncated successfully.' });
		})
	})
})

router.get('/rides', (req, res) => {
	const query = 'SELECT * FROM rideallocation_Pickup';
	connection.query(query, (err, results) => {
		if (err) {
			console.error('Error retrieving rides:', err);
			return res.status(500).json({ error: 'Database error' });
		}

		res.status(200).json(results);

	});
});

router.get('/rides/:VehicleId', (req, res) => {
	const VehicleId = req.params.VehicleId;

	const query = 'SELECT * FROM rideallocation_Pickup WHERE VehicleId = ?';

	connection.query(query, [VehicleId], (err, results) => {
		if (err) {
			console.error('Error fetching data:', err);
			return res.status(500).send('Internal Server Error');
		}
		if (results.length === 0) {
			return res.status(404).send('Vehicle not found');
		}
		res.json(results);  // Return all results instead of just the first one
	});
});

router.get('/getPickup', (req, res) => {
	const query = 'SELECT * FROM rideallocation_Pickup';

	connection.query(query, (error, results) => {
		if (error) {
			console.error('Error fetching data from rideallocation_Pickup:', error);
			return res.status(500).json({ message: 'Error fetching data from rideallocation_Pickup table' });
		}
		res.json(results);
	});
});

router.get('/showtrips', (req, res) => {
	const query = "SELECT * FROM TripHistory";
	connection.query(query, (err, result) => {
		if (err) return res.status(500).send(err);
		res.send(result);
	})
});

module.exports = router;