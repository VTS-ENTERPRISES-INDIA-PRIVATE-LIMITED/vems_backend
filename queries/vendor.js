const express = require('express');
const router = express.Router();
const connection = require('../db');

(async () => {
	await connection.query(`
		CREATE TABLE IF NOT EXISTS VendorDetails (
			VendorId Varchar(30) primary key,
			VendorName Varchar(50),
			ContactNumber Varchar(30),
			Email  Varchar(60),
			AadharCardUpload Varchar(300),
			Address Varchar(300),
			AccountHandlerName Varchar(255),
			AccountNumber Varchar(60),
			BankName Varchar(40),
			IFSCCode Varchar(50),
			BranchName  Varchar(100)
		);`
	);
})();

router.get('/getIdnName', (req, res) => {
	const query = 'SELECT VendorId, VendorName FROM VendorDetails';
	connection.query(query, (err, results) => {
		if (err) {
			console.error('Error fetching vendor details: ', err);
			res.status(500).send('Error fetching vendor details');
		} else {
			res.json(results);
		}
	});
});

router.get('/getAllVendors', (req, res) => {
	const sql = "SELECT * FROM VendorDetails";
	connection.query(sql, (err, result) => {
		if (err) {
			console.error('Error fetching data:', err);
			return res.status(500).json({ message: "Failed to fetch data", error: err });
		}
		res.status(200).json({ data: result });
	});
});

router.get('/getVendorById/:VendorId', (req, res) => {
	const VendorId = req.params.VendorId;

	const sql = `
		SELECT vd.*, va.* 
		FROM VendorDetails vd
		LEFT JOIN VendorAgreement va ON vd.VendorId = va.VendorId
		WHERE vd.VendorId = ?
	`;

	connection.query(sql, [VendorId], (err, result) => {
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

router.post('/addVendor', (req, res) => {
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
			AadharCardUpload,
			AgreementStartDate,
			AgreementEndDate,
			AgreementAmount,
			AmountPaid,
			AgreementUpload
		} = req.body;

		const vendorInsertQuery = `INSERT INTO VendorDetails (VendorName, ContactNumber, Email, Address, AccountHandlerName, AccountNumber, BankName, BranchName, IFSCCode, AadharCardUpload) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

		connection.query(vendorInsertQuery, [VendorName, ContactNumber, Email, Address, AccountHandlerName, AccountNumber, BankName, BranchName, IFSCCode, AadharCardUpload], (err, result) => {
			if (err) {
				return res.status(500).json({ error: 'Error inserting vendor details', details: err });
			}
			const fetchVendorIdQuery = `SELECT VendorId FROM VendorDetails WHERE Email = ?`;

			connection.query(fetchVendorIdQuery, [Email], (err, vendorResult) => {
				if (err || vendorResult.length === 0) {
					return res.status(500).json({ error: 'Error fetching VendorId', details: err });
				}

				const vendorId = vendorResult[0].VendorId;
				const agreementInsertQuery = `INSERT INTO VendorAgreement (VendorId, AgreementStartDate, AgreementEndDate, AgreementAmount, AmountPaid, AgreementUpload) VALUES (?, ?, ?, ?, ?, ?)`;

				connection.query(agreementInsertQuery, [vendorId, AgreementStartDate, AgreementEndDate, AgreementAmount, AmountPaid, AgreementUpload], (err) => {
					if (err) {
						return res.status(500).json({ error: 'Error inserting vendor agreement', details: err });
					}

					res.status(201).json({ message: 'Vendor and agreement added successfully' });
				});
			});
		});
	} catch (error) {
		res.status(500).json({ error: 'Internal server error', details: error });
	}
});

router.put('/updateVendorById/:VendorId', async (req, res) => {
	const VendorId = req.params.VendorId;
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
		AadharCardUpload,
		AgreementStartDate,
		AgreementEndDate,
		AgreementAmount,
		AmountPaid,
		AgreementUpload
	} = req.body;

	console.log(req.body);
	
	// SQL query for updating VendorDetails
	const updateVendorDetailsSql = `
		UPDATE VendorDetails
		SET VendorName = ?, ContactNumber = ?, Email = ?, Address = ?, AccountHandlerName = ?, 
			AccountNumber = ?, BankName = ?, BranchName = ?, IFSCCode = ?, AadharCardUpload = ?
		WHERE VendorId = ?
	`;

	// SQL query for updating VendorAgreement
	const updateVendorAgreementSql = `
		UPDATE VendorAgreement
		SET AgreementStartDate = ?, AgreementEndDate = ?, AgreementAmount = ?, AmountPaid = ?, AgreementUpload = ?
		WHERE VendorId = ?
	`;

	// Start the update operation
	connection.beginTransaction((transactionErr) => {
		if (transactionErr) {
			console.error('Transaction error:', transactionErr);
			return res.status(500).json({ message: 'Transaction failed', error: transactionErr });
		}

		// Update VendorDetails
		connection.query(updateVendorDetailsSql, [
			VendorName,
			ContactNumber,
			Email,
			Address,
			AccountHandlerName,
			AccountNumber,
			BankName,
			BranchName,
			IFSCCode,
			AadharCardUpload,
			VendorId
		], (vendorDetailsErr, vendorDetailsResult) => {
			if (vendorDetailsErr) {
				return connection.rollback(() => {
					console.error('Error updating VendorDetails:', vendorDetailsErr);
					return res.status(500).json({ message: 'Failed to update VendorDetails', error: vendorDetailsErr });
				});
			}

			// Update VendorAgreement
			connection.query(updateVendorAgreementSql, [
				AgreementStartDate,
				AgreementEndDate,
				AgreementAmount,
				AmountPaid,
				AgreementUpload,
				VendorId
			], (vendorAgreementErr, vendorAgreementResult) => {
				if (vendorAgreementErr) {
					return connection.rollback(() => {
						console.error('Error updating VendorAgreement:', vendorAgreementErr);
						return res.status(500).json({ message: 'Failed to update VendorAgreement', error: vendorAgreementErr });
					});
				}

				// Commit transaction if both updates succeed
				connection.commit((commitErr) => {
					if (commitErr) {
						return connection.rollback(() => {
							console.error('Commit error:', commitErr);
							return res.status(500).json({ message: 'Commit failed', error: commitErr });
						});
					}
					res.status(200).json({ message: 'Vendor updated successfully' });
				});
			});
		});
	});
});

router.delete('/deleteVendorByName/:VendorID', (req, res) => {
	const VendorID = req.params.VendorID;
	const sql = "DELETE FROM VendorDetails WHERE VendorID = ?";

	connection.query(sql, [VendorID], (err, result) => {
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

module.exports = router;