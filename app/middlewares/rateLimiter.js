const rateLimit = require('express-rate-limit');

const signInLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 5, 
    message: 'Too many login attempts from this IP, please try again after a minute',
    headers: true, 
});

module.exports= signInLimiter;
