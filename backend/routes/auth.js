import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/User.js";
import auth from "../middleware/auth.js";

import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "../utils/email.js";

const router = Router();

function signToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
}

/* =====================================================
   SIGNUP
===================================================== */

router.post("/signup", async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const existing =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existing) {
      return res.status(409).json({
        message:
          "An account with this email already exists",
      });
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name,
        email: normalizedEmail,
        password: passwordHash,
      });

    const token =
      signToken(user._id);

    res.status(201).json({
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasCompletedOnboarding:
          user.hasCompletedOnboarding,
      },
    });

  } catch (err) {
    next(err);
  }
});

/* =====================================================
   LOGIN
===================================================== */

router.post("/login", async (req, res, next) => {
  console.log("LOGIN ROUTE HIT");

  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const match =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!match) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    console.log(
      "WELCOME EMAIL CHECK:",
      user.email,
      user.hasReceivedWelcomeEmail
    );

    if (
      !user.hasReceivedWelcomeEmail
    ) {
      try {
        await sendWelcomeEmail(
          user.email,
          user.name
        );

        user.hasReceivedWelcomeEmail =
          true;

        await user.save();

      } catch (emailError) {
        console.error(
          "Welcome email failed:",
          emailError
        );
      }
    }

    const token =
      signToken(user._id);

    res.json({
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasCompletedOnboarding:
          user.hasCompletedOnboarding,
      },
    });

  } catch (err) {
    next(err);
  }
});

/* =====================================================
   FORGOT PASSWORD
===================================================== */

router.post(
  "/forgot-password",
  async (req, res, next) => {
    try {
      const {
        email,
      } = req.body;

      if (!email) {
        return res.status(400).json({
          message:
            "Email is required",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      const user =
        await User.findOne({
          email: normalizedEmail,
        });

      /*
       * Always return the same message,
       * whether the account exists or not.
       *
       * This prevents people from discovering
       * which email addresses have accounts.
       */

      if (!user) {
        return res.json({
          message:
            "If an account exists with that email, a password reset link has been sent.",
        });
      }

      /*
       * Create a random reset token.
       */

      const rawToken =
        crypto.randomBytes(32).toString("hex");

      /*
       * Store only the hash in MongoDB.
       */

      const hashedToken =
        crypto
          .createHash("sha256")
          .update(rawToken)
          .digest("hex");

      user.passwordResetToken =
        hashedToken;

      user.passwordResetExpires =
        new Date(
          Date.now() +
            15 * 60 * 1000
        );

      await user.save();

      const frontendUrl =
        process.env.CLIENT_ORIGIN ||
        "http://localhost:5173";

      const resetUrl =
        `${frontendUrl}/reset-password/${rawToken}`;

      try {
        await sendPasswordResetEmail(
          user.email,
          user.name,
          resetUrl
        );
      } catch (emailError) {

        console.error(
          "Password reset email failed:",
          emailError
        );

        /*
         * Clear the token if email delivery
         * failed so it cannot be used.
         */

        user.passwordResetToken =
          null;

        user.passwordResetExpires =
          null;

        await user.save();

        return res.status(500).json({
          message:
            "Could not send the password reset email. Please try again later.",
        });
      }

      return res.json({
        message:
          "If an account exists with that email, a password reset link has been sent.",
      });

    } catch (err) {
      next(err);
    }
  }
);

/* =====================================================
   RESET PASSWORD
===================================================== */

router.post(
  "/reset-password",
  async (req, res, next) => {
    try {
      const {
        token,
        password,
      } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          message:
            "Reset token and new password are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters",
        });
      }

      const hashedToken =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

      const user =
        await User.findOne({
          passwordResetToken:
            hashedToken,

          passwordResetExpires: {
            $gt: new Date(),
          },
        });

      if (!user) {
        return res.status(400).json({
          message:
            "This password reset link is invalid or has expired.",
        });
      }

      user.password =
        await bcrypt.hash(
          password,
          10
        );

      /*
       * Token becomes unusable immediately
       * after a successful password reset.
       */

      user.passwordResetToken =
        null;

      user.passwordResetExpires =
        null;

      await user.save();

      return res.json({
        message:
          "Password reset successfully. You can now log in.",
      });

    } catch (err) {
      next(err);
    }
  }
);

/* =====================================================
   CURRENT USER
===================================================== */

router.get(
  "/me",
  auth,
  async (req, res, next) => {
    try {
      const user =
        await User.findById(
          req.userId
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      res.json({
        user,
      });

    } catch (err) {
      next(err);
    }
  }
);

export default router;