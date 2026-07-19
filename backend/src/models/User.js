const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Advisor',
      required: true
    },
    email: { type: String, required: true, unique: true },
    passwordHash: {
      type: String,
      required: function () {
        return !this.googleId;
      }
    },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['advisor', 'admin'], default: 'advisor' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
