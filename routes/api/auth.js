import express from "express";
import authController from "../../controllers/auth.js";
import { validateBody, authenticate, isEmptyBody } from "../../middlewares/index.js";
import { registerSchema, loginSchema, userEmailSchema, updateSubscriptionSchema } from "../../models/user.js";
import userSchemas from "../../models/user.js";
import { upload } from "../../middlewares/index.js"
import { updateAvatar } from "../../controllers/updateAvatar.js";

const registerValidate = validateBody(registerSchema);
const loginValidate = validateBody(loginSchema);
const userEmailValidate = validateBody(userEmailSchema);
const updateSubscriptionValidate = validateBody(updateSubscriptionSchema);




const authRouter = express.Router();

// Sign Up
authRouter.post("/register", isEmptyBody, registerValidate, authController.register);

authRouter.get("/verify/:verificationCode", authController.verify);

authRouter.post("/verify", isEmptyBody, userEmailValidate, authController.resendVerifyEmail);

// Sign In
authRouter.post("/login", isEmptyBody, loginValidate, authController.login);


// Get current user
authRouter.get("/current", authenticate, authController.getCurrent);

// Logout
authRouter.post("/logout", authenticate, authController.logout);

// Update subscription
authRouter.patch("/", authenticate, updateSubscriptionValidate, authController.updateSubscription);

authRouter.patch("/avatars", authenticate, upload.single("avatar"), updateAvatar);



export default authRouter;