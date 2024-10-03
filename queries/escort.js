const express = require('express');
const router = express.Router();
const connection = require('../db');

(async () => {
	// await connection.query('');
})();

router.get('/getAllEscorts', (req, res) => {
	const sql = "SELECT * FROM EscortManagement";
	connection.query(sql, (err, result) => {
		if (err) {
			console.error('Error fetching data:', err);
			return res.status(500).json({ message: "Failed to fetch data", error: err });
		}
		res.status(200).json({ data: result });
	});
});

router.get('/getEscortById/:id', (req, res) => {
	const vendorId = req.params.id;
	const sql = "SELECT * FROM EscortManagement WHERE EscortName = ?";

	connection.query(sql, [vendorId], (err, result) => {
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

router.put('/updateEscortById/:EscortId', (req, res) => {
	const EscortId = req.params.EscortId;
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
		ShiftStartTime,
		ShiftEndTime
	} = req.body;

	const sql = `UPDATE EscortManagement SET EscortName = ?,
		ContactNumber = ?, Age = ?, Address = ?,
		AadharCardUpload = ?, CertificationUpload = ?, EscortProfilePicUpload = ?,
		AccountHandlerName = ?, AccountNumber = ?, BankName = ?, BranchName = ?, IFSCCode = ?, ShiftStartTime = ?, ShiftEndTime = ?
		WHERE EscortId = ?`;

	connection.query(sql, [
		EscortName, ContactNumber, Age, Address,
		AadharCardUpload, CertificationUpload, EscortProfilePicUpload,
		AccountHandlerName, AccountNumber, BankName, BranchName, IFSCCode, 
		ShiftStartTime, ShiftEndTime, EscortId
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

router.delete('/deleteEscortById/:EscortId', (req, res) => {
	const EscortId = req.params.EscortId;
	const sql = "DELETE FROM EscortManagement WHERE EscortId = ?";

	connection.query(sql, [EscortId], (err, result) => {
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

router.post('/addEscort', (req, res) => {
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
			ShiftStartTime,
			ShiftEndTime
		} = req.body;
		console.log(req.body);
		

		const sql = `INSERT INTO EscortManagement 
			  (EscortName, ContactNumber, Age, Address, AadharCardUpload, CertificationUpload, EscortProfilePicUpload, 
				AccountHandlerName, AccountNumber, BankName, BranchName, IFSCCode, ShiftStartTime, ShiftEndTime) 
			  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

		connection.query(sql, [
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
			ShiftStartTime,
			ShiftEndTime
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

module.exports = router;