const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const verifyToken = require('../verifyToken');

// UPDATE
router.put('/:id', verifyToken, async (req, res) => {
	if (req.user.id === req.params.id || req.user.isAdmin) {
		console.log(req.body, 'body');
		if (req.body.password) {
			const _user = await User.findById(req.user.id);
			const bytes = CryptoJS.AES.decrypt(
				_user.password,
				process.env.SECRET_KEY
			);
			const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

			if (originalPassword !== req.body.password) {
				return res.status(401).json({ data: 'Wrong password!' });
			}
			req.body.password = CryptoJS.AES.encrypt(
				req.body.password,
				process.env.SECRET_KEY
			).toString();
		}
		try {
			const updatedUser = await User.findByIdAndUpdate(
				req.params.id,
				{
					$set: req.body,
				},
				{ new: true }
			);
			res.status(200).json(updatedUser);
		} catch (err) {
			res.status(500).json(err);
		}
	} else {
		res.status(403).json('You can update only your account!');
	}
});

// DELETE
router.delete('/:id', verifyToken, async (req, res) => {
	if (req.user.id === req.params.id || req.user.isAdmin) {
		try {
			await User.findByIdAndDelete(req.params.id);
			res.status(200).json('User has been deleted.');
		} catch (err) {
			res.status(500).json(err);
		}
	} else {
		res.status(403).json('You can delete only  your account!');
	}
});

// GET
router.get('/find/:id', async (req, res) => {
	try {
		const user = await User.findByIdAnd(req.params.id);
		const { password, ...info } = user;
		res.status(200).json(info);
	} catch (err) {
		res.status(500).json(err);
	}
});

// GET ALL
router.get('/', verifyToken, async (req, res) => {
	const query = req.query.new;
	if (req.user.isAdmin) {
		try {
			const users = query
				? await User.find().sort({ _id: -1 }).limit(5)
				: await User.find();
			res.status(200).json(users);
		} catch (err) {
			res.status(500).json(err);
		}
	} else {
		res.status(403).json('You are not allowed to see all users');
	}
});

// GET USER STATS
router.get('/stats', async (req, res) => {
	const today = new Date();
	const lastYear = today.setFullYear(today.setFullYear() - 1);

	try {
		const data = await User.aggregate([
			{
				$project: {
					month: { $month: '$createdAt' },
				},
			},
			{
				$group: {
					_id: '$month',
					total: { $sum: 1 },
				},
			},
		]);
		res.status(200).json(data);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
