import { Schema, model } from "mongoose";
import Joi from "joi";
import { handleSaveError, runValidatorsAtUpdate } from "./hooks.js";

const emailRegExp = /^.+@.+\..+$/;

const userSchema = new Schema(
  {
    password: {
      type: String,
      minlength: 8,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      match: emailRegExp,      
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: "",
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, 'Verify token is required'],
    },
    avatarURL: {
      type: String,
      required: true,
    }
  }, { versionKey: false },{ timestamps: true }
);

userSchema.post("save", handleSaveError);

// userSchema.pre("findOneAndUpdate", runValidatorsAtUpdate);

userSchema.post("findOneAndUpdate", handleSaveError);



export const registerSchema = Joi.object({ 
  email: Joi.string().pattern(emailRegExp).required().messages({
      "any.required": "missing required field email"
    }),
  password: Joi.string().min(8).required(),
  subscription: Joi.string(),
});

export const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegExp).required().messages({
      "any.required": "missing required field email"
    }),
  password: Joi.string().min(8).required(),
});

export const userEmailSchema = Joi.object({
    email: Joi.string().pattern(emailRegExp).required().messages({
      "any.required": "missing required field email"
    }),
})

export const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});


const schemas = {
  registerSchema,
  loginSchema,
  userEmailSchema,
  updateSubscriptionSchema,
};

const User = model("user", userSchema);

export default {
   User,
   schemas
};
