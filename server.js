const express = require('express');
const helmet = require('helmet');
const path = require('path');
const morgan = require('morgan');
require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
// routes
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser
app.use(express.json());
// set security headers
app.use(helmet());
// prevent XSS attacks
app.use(xss());
// prevent http param pollution
app.use(hpp());
// enable cors
app.use(cors());
// cookie parser
app.use(cookieParser());
// sanitize
app.use(mongoSanitize());
// rate limit
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 mins
	max: 100
});
app.use(limiter);

// connect to database
connectDB();
// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}

// file upload
app.use(fileupload());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

// custom error handler middleware
app.use(errorHandler);

const server = app.listen(
	PORT,
	console.log(`Server running in ${process.env.NODE_ENV} on port ${process.env.PORT}`.yellow.bold)
);
// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`.red.bold);
	// close server and exit process
	server.close(() => process.exit(1));
})