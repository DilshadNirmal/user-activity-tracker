const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    activities: [
      {
        type: {
          type: String,
          enum: ["login", "logout"],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        ipAddress: {
          type: String,
          required: true,
        },
        location: {
          city: String,
          country: String,
          latitude: Number,
          longitude: Number
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
