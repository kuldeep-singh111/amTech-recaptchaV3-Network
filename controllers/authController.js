const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const userModel = require('../models/userModel');

exports.getRegister = (req, res) => res.render('register', { error: null, success: null });
exports.postRegister = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Validation checks
        if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            return res.render('register', { error: 'Invalid email', success: null });
        }

        if (password.length < 8) {
            return res.render('register', { error: 'Password too short', success: null });
        }


        const exists = await userModel.findByEmailOrUsername(email);
        if (exists) {
            return res.render('register', { error: 'Username or email exists', success: null });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.createUser(username, email, hashedPassword);


        res.render('login', { error: null, success: 'Registration successful. Please login.' });

    } catch (err) {
        console.error('Registration Error:', err); // Console me error dekhne ke liye
        res.render('register', {
            error: err.message || 'Something went wrong during registration',
            success: null
        });
    }
};

exports.getLogin = (req, res) => res.render('login', { error: null });

exports.postLogin = async (req, res) => {
    const { identifier, password, 'g-recaptcha-response': captchaToken } = req.body;

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: captchaToken,
                },
            }
        );

        if (!response.data.success) return res.render('login', { error: 'Invalid reCAPTCHA' });
    } catch (err) {
        console.error('reCAPTCHA error:', err.message);
        return res.render('login', { error: 'Failed to verify reCAPTCHA' });
    }

    const user = await userModel.findByEmailOrUsername(identifier);
    if (!user || !(await bcrypt.compare(password, user.password)))
        return res.render('login', { error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/profile');
};

exports.getProfile = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findProfileById(data.id);
        res.render('profile', { user });
    } catch {
        res.clearCookie('token');
        res.redirect('/login');
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
};
