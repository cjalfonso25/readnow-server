const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Post = require("./posts");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email!");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password cannot contain 'password'");
        }
      },
    },
    role: {
      type: String,
    },
    title: {
      type: String,
    },
    about: {
      type: String,
    },
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    instagram: {
      type: String,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
    isAdmin: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

//return only needed data to user
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// method to generate token in login and other user related requests
userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Used in /api/users/login
userSchema.statics.findByCredentials = async (username, password) => {
  const user = await Users.findOne({ username });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

// Hashe plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "owner",
});

// DElete user taks when user is removed
userSchema.pre("remove", async function (next) {
  const user = this;
  await Post.deleteMany({ owner: user._id });
  next();
});

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
