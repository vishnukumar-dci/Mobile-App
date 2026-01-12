require('dotenv').config()
const userDB = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


exports.createUser = async (req, res) => {
    const { firstName, lastName, email, password, phoneno } = req.body
    try {

        const existingUser = await userDB.findOne({ email: email })

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists', statusCode: 400, success: false, data: {} })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = new userDB({
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: hashPassword,
            phoneNo: phoneno
        })

        await newUser.save()

        res.status(201).json({ success: true, statusCode: 201, message: 'Registration was successful', data: { email: email } })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', statusCode: 500, data: {} })
    }
}

exports.loginUser = async (req, res) => {
    const { email, password } = req.body
    try {

        const user = await userDB.findOne({ email: email })

        const validPassword = await bcrypt.compare(password, user.password)

        if (!user || !validPassword) {
            return res.status(401).json({ message: 'Invalid Credentials', statusCode: 401, success: false, data: {} })
        }

        const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, { expiresIn: '1hr' })

        res.status(200).json({ success: true, statusCode: 200, message: 'Login was Successful', data: { email: user.email, token } })

    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', statusCode: 500, data: {} })
    }
}

exports.updateUser = async (req, res) => {
    const { firstName, lastName, phoneno } = req.body
    try {

        const email = req.user.email

        const updateData = {
            first_name: firstName,
            last_name: lastName,
            phoneNo: phoneno
        }

        const updatedUser = await userDB.findOneAndUpdate(
            { email },
            updateData,
            { new: true }
        )

        if (!updatedUser) {
            console.log(updatedUser)
            return res.status(404).json({ message: 'User Not Found', statusCode: 404, success: false, data: {} })
        }

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'User updated successfully',
            data: {
                email: updatedUser.email,
                firstName: updatedUser.first_name,
                lastName: updatedUser.last_name,
                phoneNo: updatedUser.phoneNo
            }
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error', statusCode: 500, data: {} })
    }
}

exports.getUser = async (req, res) => {
    try {
        const email = req.user.email

        const existingUser = await userDB.findOne({ email: email })

        if (!existingUser) {
            return res.status(404).json({ message: 'User Not Found', statusCode: 404, success: false, data: {} })
        }

        const data = {
            email: existingUser.email,
            firstName: existingUser.first_name,
            lastName: existingUser.last_name,
            phoneno: existingUser.phoneNo,
            profile: existingUser.profilePicture,
            status: existingUser.isActive
        }

        res.status(200).json({ success: true, statusCode: 200, message: 'User retrived successfully', data })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', statusCode: 500, data: {} })
    }
}