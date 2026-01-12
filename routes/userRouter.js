const express = require("express");
const { body } = require("express-validator");
const userController = require("../controller/userController");
const authenticateToken = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const imageController = require('../controller/imageController')

const router = express.Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),

    body("firstName")
      .notEmpty()
      .withMessage("First name is required")
      .isString()
      .withMessage("First name must be a string")
      .trim(),

    body("lastName")
      .notEmpty()
      .withMessage("Last name is required")
      .isString()
      .withMessage("Last name must be a string")
      .trim(),

    body("phoneno")
      .notEmpty()
      .withMessage("Phone number is required")
      .isMobilePhone("any")
      .withMessage("Please provide a valid phone number"),
  ],
  userController.createUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  userController.loginUser
);

router.get("/get-user", authenticateToken, userController.getUser);

router.put(
  "/update",
  authenticateToken,
  upload.single("profile"),
  [
    body("firstName")
      .optional()
      .isString()
      .withMessage("First name must be a string")
      .trim(),

    body("lastName")
      .optional()
      .isString()
      .withMessage("Last name must be a string")
      .trim(),

    body("phoneno")
      .optional()
      .isMobilePhone("any")
      .withMessage("Please provide a valid phone number"),
  ],
  userController.updateUser
);

router.post('/generate-image',imageController.generateImage)


module.exports = router;
