const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const serviceAccount = require('../ServiceAccountKey.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

// REGISTER / SIGN UP
router.post('/register', async (req, res) => {
	// sign up and encrypt the password
	const newUser = new User({
		username: req.body.username,
		email: req.body.email,
		password: CryptoJS.AES.encrypt(
			req.body.password,
			process.env.SECRET_KEY
		).toString(),
	});

	try {
		const user = await newUser.save();
		res.status(201).json(user);
	} catch (err) {
		res.status(500).json(err);
	}
});

// LOGIN
router.post('/login', async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });
		if (!user) return res.status(401).json('Wrong password or username!');

		// decrypting the password
		const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
		const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

		if (originalPassword !== req.body.password) {
			return res.status(401).json('Wrong password or username!');
		}

		// create customToken to be able to use firebase storage
		const customToken = await admin
			.auth()
			.createCustomToken(user._id.toString());

		// create accessToken
		const accessToken = jwt.sign(
			{ id: user._id, isAdmin: user.isAdmin },
			process.env.ACCESS_TOKEN_SECRET_KEY,
			{ expiresIn: '5d' }
		);

		// { id: user._id, isAdmin: user.isAdmin } this is the payload. we'll use it in verifyToken

		const { password, ...info } = user._doc;

		res.status(200).json({ ...info, accessToken, customToken });
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
