const router = require('express').Router();
const List = require('../models/List');
const verifyToken = require('../verifyToken');

// CREATE
router.post('/', verifyToken, async (req, res) => {
	if (req.user.isAdmin) {
		const newList = new List(req.body);
		try {
			const savedList = await newList.save();
			res.status(201).json(savedList);
		} catch (err) {
			res.status(500).json(err);
		}
	} else {
		res.status(403).json('You are not allowed to do this!');
	}
});

// DELETE
router.delete('/:id', verifyToken, async (req, res) => {
	if (req.user.isAdmin) {
		try {
			await List.findByIdAndDelete(req.params.id);
			res.status(201).json('The list has been deleted');
		} catch (err) {
			res.status(500).json(err);
		}
	} else {
		res.status(403).json('You are not allowed to do this!');
	}
});

// GET ALL
router.get('/', verifyToken, async (req, res) => {
	const typeQuery = req.query.type;
	const genreQuery = req.query.genre;
	let list = [];

	try {
		if (typeQuery) {
			if (genreQuery) {
				list = await List.aggregate([
					{ $sample: { size: 10 } },
					{ $match: { type: typeQuery, genre: genreQuery } },
				]);
			} else {
				list = await List.aggregate([
					{ $sample: { size: 10 } },
					{ $match: { type: typeQuery } },
				]);
			}
		} else {
			list = await List.find();
		}
		res.status(200).json(list);
	} catch (err) {
		res.status(500).json(err);
	}
});

// GET A SINGLE LIST
router.get('/find/:id', verifyToken, async (req, res) => {
	try {
		const list = await List.findById(req.params.id);
		res.status(200).json(list);
	} catch (err) {
		res.status(500).json(err);
	}
});
module.exports = router;
