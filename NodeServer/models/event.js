const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../Utils/encryption");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      set: encrypt,
      get: decrypt,
    },
    description: {
      type: String,
      set: encrypt,
      get: decrypt,
    },
    imageUrl: String,
    eventType: String,
    eventDate: {
      type: Date,
      required: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      set: encrypt,
      get: decrypt,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    registeredUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

eventSchema.pre("save", function (next) {
  if (this.registrationDeadline > this.eventDate) {
    return next(new Error("Registration deadline must be before event date"));
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);
