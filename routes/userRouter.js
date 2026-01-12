const express = require('express')
const userController = require('../controller/userController')
const authenticateToken = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', userController.createUser)

router.post('/login', userController.loginUser)

router.get('/get-user', authenticateToken, userController.getUser)

router.put('/update', authenticateToken, userController.updateUser)

module.exports = router