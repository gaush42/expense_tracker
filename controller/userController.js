const bcrypt = require('bcryptjs')

const User = require('../model/userModel')

exports.RegisterUser = async (req, res) => {
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
        const newUser = await User.create({ fullname, email, password:hashedPassword})
        res.status(201).json({
            message: 'User registered successfully.', user: newUser
        })
    } catch (err) {
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
        res.status(200).json({ message: 'Login successful.',
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
