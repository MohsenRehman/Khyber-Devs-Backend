import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "viewer"],
      default: "viewer",
    },
    profileImage: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    jobTitle: {
      type: String,
      default: "",
    },
    twofaEnabled: {
      type: Boolean,
      default: false,
    },
    twofaSecret: {
      type: String,
      select: false,
    },
    hashedRefreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
    lastLogin: {
      type: Date,
    },
    loginHistory: [
      {
        ipAddress: String,
        userAgent: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["active", "suspended", "locked"],
      default: "active",
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving + Enforce password rules (upper, lower, digit, spec, min 10 chars)
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-[\]{}|;:',.<>/?~`])[A-Za-z\d@$!%*?&#^()_+=\-[\]{}|;:',.<>/?~`]{10,}$/;

  if (!passwordRegex.test(this.password)) {
    return next(
      new Error(
        "Password complexity rule failed: Minimum 10 characters, 1 uppercase, 1 lowercase, 1 digit, and 1 special symbol required."
      )
    );
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password helper
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if admin is currently locked out
adminSchema.methods.isLocked = function () {
  return !!(this.lockedUntil && this.lockedUntil > Date.now());
};

export const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
