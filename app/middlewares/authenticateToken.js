const jwt = require("jsonwebtoken");
require('dotenv').config();

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send({ status: false, code: 401, msg: 'TOKEN_NOT_FOUND' });
    try {
        let decodedTokenData = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decodedTokenData;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const refreshToken = req.header('x-refresh-token');
            if (!refreshToken) return res.status(401).send({ status: false, code: 401, msg: 'REFRESH_TOKEN_NOT_FOUND' });
            try {
                let decodedRefreshTokenData = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                const newAccessToken = jwt.sign(
                    { email: decodedRefreshTokenData.email, id: decodedRefreshTokenData.id },
                    process.env.SECRET_KEY,
                    { expiresIn: '1h' }
                );
                res.setHeader('x-auth-token', newAccessToken);
                req.user = jwt.verify(newAccessToken, process.env.SECRET_KEY);
                next();
            } catch (refreshError) {
                console.log(refreshError);
                return res.status(401).send({ status: false, code: 401, msg: 'INVALID_REFRESH_TOKEN' });
            }
        } else {
            console.log(error);
            return res.status(401).send({ status: false, code: 401, msg: "Unauthorized User" });
        }
    }
};

