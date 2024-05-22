const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require('../models/userModel')
require('dotenv').config();
const crypto = require('crypto');
const utils = require('../utils/emailUtils')

exports.signup = async (req) => {
    try {
        const { name, email, password } = req.body;
        const allowedFields = ['name', 'email', 'password'];
        const requestFields = Object.keys(req.body);
        if (requestFields.length > allowedFields.length || !requestFields.every(field => allowedFields.includes(field))) {
            return { status: false, code: 400, msg: 'Too many fields provided. Only name, email, and password are allowed.' };
        }
        if (!email) {
            return { status: false, code: 400, msg: 'Please enter the emailId' }
        }
        if (!password) {
            return { status: false, code: 400, msg: 'Please enter the password' }
        }
        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            return { status: false, code: 400, msg: 'User Already Exists. Please Signin!' }
        }
        if (!name) {
            return { status: false, code: 400, msg: 'Please enter the username' }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const confirmationToken = crypto.randomBytes(20).toString('hex');
        const result = await userModel.create({
            name: name,
            email: email,
            password: hashedPassword,
            confirmationToken: confirmationToken
        });
        const accessToken = jwt.sign({ email: result.email, id: result._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ email: result.email, id: result._id }, process.env.REFRESH_TOKEN_SECRET);

        const confirmationUrl = `http://localhost:5004/api/users/confirm/${confirmationToken}`;

        const data = {
            from: process.env.EMAIL_USER,
            to: result.email,
            subject: 'Email Confirmation',
            text: `Please confirm your email by clicking the following link: ${confirmationUrl}`,
            html: `<p>Please confirm your email by clicking the following link: <a href="${confirmationUrl}">Confirm your email</a></p>`
        }
        await utils.sendMail(data);

        return { status: true, data: { user: result, accesstoken: accessToken, refreshToken: refreshToken } };
    } catch (error) {
        console.log(error);
        return { status: false, code: 500, msg: error.message }
    }
}

exports.signin = async (req) => {
    try {
        const { email, password } = req.body;
        const allowedFields = ['email', 'password'];
        const requestFields = Object.keys(req.body);
        if (requestFields.length > allowedFields.length || !requestFields.every(field => allowedFields.includes(field))) {
            return { status: false, code: 400, msg: 'Too many fields provided. Only email and password are allowed.' };
        }
        if (!email) {
            return { status: false, code: 400, msg: 'Please enter the emailId' };
        }
        if (!password) {
            return { status: false, code: 400, msg: 'Please enter the password' };
        }
        const existingUser = await userModel.findOne({ email: email });
        if (!existingUser) {
            return { status: false, code: 400, msg: "User not found. Please Signup!" };
        }
        const matchPassword = await bcrypt.compare(password, existingUser.password);
        if (!matchPassword) {
            return { status: false, code: 400, msg: "Invalid Credentials" };
        }
        const now= new Date()
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        };
        const readableLastLoggedIn = now.toLocaleDateString('en-US', options);
        existingUser.lastLoggedIn= readableLastLoggedIn
        await existingUser.save();

        const accessToken = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.REFRESH_TOKEN_SECRET);

        return ({
            status: true,
            data: {
                user: existingUser,
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        });
    } catch (error) {
        console.log(error);
        return { status: false, code: 500, msg: { msg: error.message } }
    }
}

exports.confirmEmail = async (req) => {
    try {
        const token = req.params.token;
        const user = await userModel.findOne({ confirmationToken: token });
        if (!user) {
            return { status: false, code: 400, msg: 'Invalid token' };
        }
        user.isConfirmed = true;
        user.confirmationToken = undefined;
        await user.save();
        return { status: true, msg: 'Email confirmed successfully' };
    } catch (error) {
        console.log(error);
        return { status: false, code: 500, msg: error.message };
    }
};

exports.forgotPassword = async (req) => {
    try {
        const { email } = req.body;
        if (!email) {
            return { status: false, code: 400, msg: 'Please enter your email' };
        }
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return { status: false, code: 400, msg: 'User not found' };
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetUrl = `http://localhost:5004/api/users/reset-password/${resetToken}`;
        const data = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset',
            text: `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`,
            html: `<p>Please reset your password by clicking the following link: <a href="${resetUrl}">Reset your password</a></p>`
        }
        await utils.sendMail(data);

        return { status: true, msg: 'Password reset email sent' };
    } catch (error) {
        console.log(error);
        return { status: false, code: 500, msg: error.message };
    }
};

exports.resetPassword = async (req) => {
    try {
        const token = req.params.token;
        const { newPassword } = req.body;
        if (!newPassword) {
            return { status: false, code: 400, msg: 'Please enter a new password' };
        }
        const user = await userModel.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            return { status: false, code: 400, msg: 'Invalid or expired token' };
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return { status: true, msg: 'Password reset successfully' };
    } catch (error) {
        console.log(error);
        return { status: false, code: 500, msg: error.message };
    }
};

