const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const User = require('../model/userModel')
const sequelize = require('../config/dbConfig')

exports.RegisterUser = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { fullname, email, password } = req.body
        if(!fullname, !email, !password){
            return res.status(400).json({
                message: 'All fields are required.'
            })
        }
        const existingUser = await User.findOne({where: {email}})
        if (existingUser){
            return res.status(409).json({
                message: 'Email already exists.'
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({ fullname, email, password:hashedPassword},
            {transaction: t}
        )
        await t.commit()
        res.status(201).json({
            message: 'User registered successfully.', user: newUser
        })
    } catch (err) {
        await t.rollback()
        console.error(err)
        res.status(500).json({message: 'Server error.'})
    }
}
exports.Login = async (req, res) => {
    try{
        const { email, password } = req.body
        if(!email || !password){
            return res.status(400).json({message:"All fields are required."})
        }
        const user = await User.findOne({where: {email}})
        const isPasswordMatched = await bcrypt.compare(password, user.password)

        if(!user || !isPasswordMatched){
            return res.status(401).json({message: 'Invalid email or Password'})
        }
        const token = jwt.sign(
            {userId: user.id},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        )
        res.status(200).json({ message: 'Login successful.',
            token,
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
}
exports.getUserProfile = async (req, res) => {
    const userId = req.userId;
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'fullname', 'email', 'isPremium']
      });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching user profile' });
    }
};
