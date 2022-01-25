const path = require('path');

const express = require('express');
const app = express();

const mongoose = require('mongoose');
const dotenv = require('dotenv');

const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const movieRoute = require('./routes/movies');
const listRoute = require('./routes/lists');

dotenv.config();

mongoose
	.connect(process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log('DB Connection Successfull'))
	.catch((err) => console.log(err));

app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/movies', movieRoute);
app.use('/api/lists', listRoute);

app.use(express.static(path.join(__dirname, '/netflix-client/build')));

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '/netflix-client/build', 'index.html'));
});

app.listen(process.env.PORT || 8080, () =>
	console.log('Server is up and running..')
);
