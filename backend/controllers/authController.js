import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ error: 'validation failed', fields: { email: 'is already registered' } });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            logger.info({ userId: user._id }, 'User registered');
            sendToken(user, 201, res);
        }
    } catch (error) {
        logger.error({ err: error, body: req.body }, 'Registration error');
        res.status(400).json({ error: 'validation failed', fields: { generic: error.message } });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    const { email, password } = req.body;

    // Check for email and password
    if (!email || !password) {
        return res.status(400).json({ error: 'validation failed', fields: { credentials: 'email and password are required' } });
    }

    try {
        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            logger.warn({ email }, 'Failed login attempt');
            return res.status(401).json({ error: 'authentication failed', fields: { credentials: 'invalid email or password' } });
        }

        logger.info({ userId: user._id }, 'User logged in');
        sendToken(user, 200, res);
    } catch (error) {
        logger.error({ err: error }, 'Login error');
        res.status(500).json({ error: 'server error' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({ success: true });
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('name email');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'server error' });
    }
};

// Get token from model, create cookie and send response
const sendToken = (user, statusCode, res) => {
    // Create token with claims user_id and email
    const token = jwt.sign(
        { id: user._id, email: user.email }, 
        process.env.JWT_SECRET, 
        { expiresIn: '24h' }
    );

    const options = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        httpOnly: true,
        path: '/', // Ensure cookie is sent for all routes
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    };

    res.status(statusCode)
        .cookie('token', token, options) // Still send cookie for convenience
        .json({
            _id: user._id,
            name: user.name,
            email: user.email
            // token field removed to enforce cookie-only auth
        });
};
