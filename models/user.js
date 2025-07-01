const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Using bcryptjs as per your provided code

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { // Storing the hashed password
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Mongoose Pre-Save Hook for Hashing Password
// This runs BEFORE a user document is saved to the database
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    // If an error occurs during hashing, pass it to the next middleware
    next(error); 
  }
});

// Method to compare candidate password with the stored hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Use bcrypt.compare to check the provided password against the hashed password
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// IMPORTANT: Check if the model already exists before compiling it
// This prevents the OverwriteModelError that occurs when the model is required multiple times
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
