const User = require('../models/userModel');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET_KEY;
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail, getAuth } = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const Product = require('../models/productModel');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error('Error fetching users', err);
        res.status(500).send('Database error');
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching current user', err);
        res.status(500).send('Database error');
    }
};

const addUser = async (req, res) => {
    const { fullName, displayName, phoneNumber, additionalPhone, email, city, isSeller, password } = req.body;
    const emailLowerCase = email.toLowerCase();

    try {
        // וולידציה למייל
        const existingUser = await User.findOne({ email: emailLowerCase });
        if (existingUser) {
            return res.status(400).json({ message: 'כתובת הדואר האלקטרוני כבר קיימת במערכת' });
        }

        // וולידציה לטלפון
        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
            return res.status(400).json({ message: 'מספר הטלפון כבר קיים במערכת' });
        }

        // וולידציה לסיסמה
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'הסיסמה לא עומדת בדרישות' });
        }

        const newUser = new User({
            fullName,
            displayName,
            phoneNumber,
            additionalPhone,
            email: emailLowerCase,
            city,
            isSeller,
            password
        });
        await newUser.save();

        const payload = { id: newUser._id, email: newUser.email };
        const token = jwt.sign(payload, secretKey, { expiresIn: '30d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 2592000000,
            sameSite: 'None'
        });

        try {
            const auth = await getAuth();
            await sendWelcomeEmail(auth, email);
        } catch (emailError) {
            console.error('שגיאה בשליחת מייל ברוכים הבאים:', emailError);
        }

        res.json({
            message: 'User created successfully',
            user: newUser
        });
    } catch (err) {
        console.error('שגיאה ביצירת המשתמש:', err);
        res.status(500).json({ message: 'שגיאת מסד נתונים' });
    }
};

const updateUserDetails = async (req, res) => {
    try {
        console.log(req.user);
        const userId = req.user.id;
        const updates = req.body;
        if (updates.email) {
            updates.email = updates.email.toLowerCase();
            const existingUser = await User.findOne({ email: updates.email });
            if (existingUser && existingUser._id !== userId) {
                return res.status(400).send('Email already exists');
            }
        }
        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!updatedUser) {
            return res.status(404).send('User not found');
        }
        console.log("Updated user:", updatedUser);
        res.json(updatedUser);
    } catch (err) {
        console.error('Error updating user', err);
        res.status(500).send('Database error');
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    console.log(loginUser);
    try {
        const user = await User.findOne({ fullName: username });
        if (!user) {
            return res.status(400).send('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }
        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, secretKey, { expiresIn: '30d' }); 
        res.cookie('token', token, {
            httpOnly: true, 
            secure: false,  
            maxAge: 2592000000, 
            sameSite: 'None' 
        });
        res.json({
            message: 'Login successful',
            user: user
        });
    } catch (err) {
        console.error('Error logging in', err);
        res.status(500).send('Server error');
    }
};

const deleteUser = async (req, res) => {
    const userId = req.user.id;
    try {
        await Product.deleteMany({ userId: userId });
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json({
            message: 'User and associated products deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting user', err);
        res.status(500).send('Server error');
    }
};

const handleGoogleLogin = async (req, res) => {
    const { googleToken } = req.body;
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${googleToken}`
            }
        });
        const googleUserInfo = await response.json();
        let user = await User.findOne({ email: googleUserInfo.email });
        if (!user) {
            user = await User.create({
                email: googleUserInfo.email,
                fullName: googleUserInfo.name,
                displayName: googleUserInfo.given_name,
                phoneNumber: 0,
                city: 'לא צוין',
                isSeller: false,
                password: require('crypto').randomBytes(16).toString('hex')
            });
            const auth = await getAuth();
            await sendWelcomeEmail(auth, user.email);
        }
        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, secretKey, { expiresIn: '30d' });
        console.log("token", token);
        res.cookie('token', token, {
            httpOnly: true, 
            secure: false,   
            maxAge: 2592000000,
            sameSite: 'None'  
        });
        res.json({
            message: 'Google login successful',
            user: user
        });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).send('Server error');
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Error fetching user by ID', err);
        res.status(500).json({ message: 'Database error' });
    }
}

const addUserFromForm = async (req, res) => {
    const { sellerName, phoneNumber, email } = req.body;

    const emailLowerCase = email.toLowerCase();

    try {
        const newUser = new User({
            fullName: sellerName,
            displayName: sellerName,
            phoneNumber,
            email: emailLowerCase,
            city: 'לא צוין',
            isSeller: true,
            password: require('crypto').randomBytes(16).toString('hex')
        });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', userId: newUser._id });

    } catch (err) {
        console.error('Error creating user from form', err);
        res.status(500).send('Database error');
    }
}

module.exports = { getAllUsers, getCurrentUser, addUser, updateUserDetails, loginUser, deleteUser, handleGoogleLogin, getUserById, addUserFromForm };
