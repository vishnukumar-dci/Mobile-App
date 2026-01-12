require("dotenv").config();
const userDB = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const logger = require('../utils/logger')

exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { firstName, lastName, email, password, phoneno } = req.body;
  try {
    const existingUser = await userDB.findOne({ email: email });

    if (existingUser) {
      logger.error(`User already exist for email:${email}`)
      return res.status(400).json({
        message: "User already exists",
        statusCode: 400,
        success: false,
        data: {},
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new userDB({
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: hashPassword,
      phoneNo: phoneno,
    });

    await newUser.save();

    logger.info(`Registration was successful for email:${email}`)
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Registration was successful",
      data: { email: email },
    });
  } catch (error) {
    logger.error(`register: ${error}`)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      statusCode: 500,
      data: {},
    });
  }
};

exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await userDB.findOne({ email: email });

    const validPassword = await bcrypt.compare(password, user.password);

    if (!user || !validPassword) {
      logger.error(`User Details Not found For email:${email}`)
      return res.status(401).json({
        message: "Invalid Credentials",
        statusCode: 401,
        success: false,
        data: {},
      });
    }

    const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, {
      expiresIn: "1hr",
    });

    logger.error(`Login was Successful for email:${email}`)

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Login was Successful",
      data: { email: user.email, token },
    });
  } catch (error) {
    logger.error(`login: ${error}`)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      statusCode: 500,
      data: {},
    });
  }
};

exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, phoneno } = req.body;

  try {
    const email = req.user.email;

    const user = await userDB.findOne({ email });
    if (!user) {
      logger.error(`User Was Not found For email:${email}`)
      return res.status(404).json({
        message: "User Not Found",
        statusCode: 404,
        success: false,
        data: {},
      });
    }

    if (firstName) user.first_name = firstName;
    if (lastName) user.last_name = lastName;
    if (phoneno) user.phoneNo = phoneno;

    if (req.file) {
    
      if (user.imagePublicId) {
        await cloudinary.uploader.destroy(user.imagePublicId);
      }

      user.profileUrl = req.file.path;
      user.profilePublicId = req.file.filename;
    }

    await user.save();

    logger.error(`User Details Updated For email:${email}`)

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User updated successfully",
      data: {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNo: user.phoneNo,
        imageUrl: user.profileUrl || null,
      },
    });
  } catch (error) {
    logger.error(`r: ${error}`)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      statusCode: 500,
      data: {},
    });
  }
};


exports.getUser = async (req, res) => {
  try {
    const email = req.user.email;

    const existingUser = await userDB.findOne({ email: email });

    if (!existingUser) {
      logger.error(`User Details Not found For email:${email}`)
      return res.status(404).json({
        message: "User Not Found",
        statusCode: 404,
        success: false,
        data: {},
      });
    }

    const data = {
      email: existingUser.email,
      firstName: existingUser.first_name,
      lastName: existingUser.last_name,
      phoneno: existingUser.phoneNo,
      imageUrl: existingUser.profileUrl,
      status: existingUser.isActive,
    };

    logger.error(`User Details retrived For email:${email}`)

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User retrived successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      statusCode: 500,
      data: {},
    });
  }
};
