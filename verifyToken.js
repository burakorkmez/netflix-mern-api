const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
	const authHeader = req.headers.token;
	if (authHeader) {
		const token = authHeader.split(' ')[1];
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, payload) => {
			if (err) return res.status(403).json('Token is not valid');
			req.user = payload;
			next();
		});
	} else {
		return res.status(401).json('You are not authenticated');
	}
};

module.exports = verifyToken;
