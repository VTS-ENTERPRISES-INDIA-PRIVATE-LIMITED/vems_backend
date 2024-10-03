const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const driver = require('./queries/driver')
const employee = require('./queries/employee')
const escort = require('./queries/escort')
const trip = require('./queries/trip')
const vehicle = require('./queries/vehicle')
const vendor = require('./queries/vendor')
const admin = require('./queries/admin')

const app = express();

const corsOptions = {
	origin: '*',
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
const session = require('express-session');

app.use(session({
	secret: 'travello',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}));

app.use('/driver', driver)
app.use('/employee', employee)
app.use('/escort', escort)
app.use('/trip', trip)
app.use('/vehicle', vehicle)
app.use('/vendor', vendor)
app.use('/admin', admin)

app.listen(process.env.PORT, () => {
	console.log(`Server is listening on port ${process.env.PORT}`);
});