import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const registerUser = async (req, res) => {
	try {
		const { userName, password } = req.body;
		const existingUserName = await User.findOne({ userName });
		if (existingUserName) {
			return res.status(400).json({ message: 'User already exists' });
		}
		if (!userName || !password) {
			return res.status(400).json({ message: 'All fields are required' });
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const newUser = new User({ userName, password: hashedPassword });
		await newUser.save();

		res.status(201).json({ message: 'User Registered Successfully' });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const loginUser = async (req, res) => {
	try {
		const { userName, password } = req.body;
		const user = await User.findOne({ userName });
		if (!user) {
			return res.status(400).json({ message: 'User not found' });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		const token = jwt.sign(
			{
				id: user._id,
				userName: user.userName,
			},
			process.env.JWT_SECRET || 'dev_secret_key',
			{ expiresIn: '2h' }
		);
		res.status(200).json({
			message: 'Login successful',
			token,
			user: { id: user._id, userName: user.userName },
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Server error' });
	}
};
export const getUserData = async (req, res) => {
	const userId = req.user._id;
	try {
		const userData = await User.findById(userId);

		res.status(200).json({ userData });
	} catch (error) {
		console.error("Error fetching user's data:", error);
		res.status(500).json({ message: 'Server error while fetching data.' });
	}
};
export const updateUserAvatar = async (req, res) => {
	const { url } = req.body;
	const userId = req.user._id;
	try {
		const user = await User.findOne({
			_id: userId,
		});
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		user.avatar = url;
		await user.save();
		res.status(200).json({
			message: 'Avatar updated successfully',
		});
	} catch (error) {
		console.error('Error updating avatar:', error);
		res.status(500).json({ message: 'Failed to update avatar' });
	}
};
