import LoginModel from '../../models/Login.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const register = async (req, res) => {
  const { name, email, userid, password, role, profile, department } = req.body;

  try {
    // Check if a user with the given email exists
    const existingUser = await LoginModel.findOne({ email });

    if (existingUser) {
      if (existingUser.userid !== userid) {
        // If the email exists but the username is different, create a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await LoginModel.create({
          name,
          email,
          userid,
          password: hashedPassword,
          role,
          profile,
          department
        });

        res.json(newUser);
      } else {
        // If user exists and username matches, update password and role
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUser.password = hashedPassword;
        existingUser.role = role;
        await existingUser.save();

        res.status(200).json(existingUser);
      }
    } else {
      // If user doesn't exist, create a new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await LoginModel.create({
        name,
        email,
        userid,
        password: hashedPassword,
        role,
        profile,
        department
      });

      res.status(200).json(newUser);
    }
  } catch (err) {
    console.error('Error during registration or update:', err);
    res.status(500).json(err);
  }
};

const login = async (req, res) => {
  const { userid, password, requestedRole } = req.body;

  try {
    const user = await LoginModel.findOne({ userid });

    if (user) {

      if (user.role !== requestedRole) {
        res.status(403).json({ success: false, message: 'User Not Activated' });
        return;
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (isPasswordMatch) {
        req.session.user = {
          userid: user.userid,
          email: user.email,
          role: user.role,
          name: user.name,
          profile: user.profile,
          department: user.department
        };

        res.cookie('sessionID', req.sessionID, {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 3600000,
        });

        res.status(200).json({ success: true, message: 'Authentication successful', email: user.email, role: user.role });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      res.status(404).json({ success: false, message: 'No User Found' });
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const logout = (req, res) => {
  const sessionId = req.sessionID;

  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });

      if (sessionId) {
        req.sessionStore.destroy(sessionId, (destroyErr) => {
          if (destroyErr) {
            console.error("Error destroying session ID:", destroyErr);
          }
        });
      }
    }
  });
};

const changepassword = async (req, res) => {
  const { newPassword } = req.body;
  const { user } = req.params;

  try {
    const existingUser = await LoginModel.findOne({ userid: user });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    existingUser.password = hashedPassword;
    await existingUser.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const forgotpassword = async (req, res) => {
  const { email, userId, newPassword } = req.body;

  try {
    const existingUser = await LoginModel.findOne({ email: email, userid: userId });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    existingUser.password = hashedPassword;
    await existingUser.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const sendotp = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await LoginModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No user found with this email' });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store the OTP and the current timestamp in the in-memory store
    const expirationTime = Date.now() + 2 * 60 * 1000; // 2 minutes in milliseconds
    otpStore.set(email, { otp, expirationTime });

    // Send the OTP to the provided email address
    const mailOptions = {
      from: {
        name: 'MERN COLLEGE Password Reset OTP',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'OTP for Password Reset',
      text: `Your OTP for password reset is: ${otp}. Please Use the OTP within 2 Minutes as it will expire after that.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
      } else {
        console.log('OTP sent:', info.response);
        res.json({ message: 'OTP sent successfully' });
      }
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'An error occurred while sending the OTP' });
  }
}

const verifyotp = async (req, res) => {
  const { email, otp } = req.body;

  // Check if the OTP is valid for the given email
  const storedOtpData = otpStore.get(email);

  if (!storedOtpData) {
    return res.json({ isVerified: false });
  }

  const { otp: storedOtp, expirationTime } = storedOtpData;

  if (storedOtp === otp && Date.now() < expirationTime) {
    // OTP is valid and not expired
    res.json({ isVerified: true });
  } else {
    // OTP is invalid or expired
    res.json({ isVerified: false });
  }
}

const sendCredentialsEmail = async (req, res) => {
  const { name, email, userid, password, role } = req.body;

  try {
    // Send email with user credentials
    const mailOptions = {
      from: {
        name: `MERN COLLEGE ERP ${role} Credentials`,
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Your Account Credentials',
      text: `Hello ${name},\n\nYour account credentials:\nUserID: ${userid}\nEmail: ${email}\nPassword: ${password}\n\nKeep this information secure.\n\nRegards,\nYour App Team`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
}

const deleteUser = async (req, res) => {
  try {
    const deletedUser = await LoginModel.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting User', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const AuthenticatedUsers = async (req, res) => {
  LoginModel.find()
    .then(users => res.json(users))
    .catch(err => res.json(err))
}

const FilteredAuthenticatedUsers = async (req, res) => {
  const searchParams = req.body;
  try {
    let user = await LoginModel.find(searchParams);
    if (!user) {
      return res.status(400).json({ success: false, message: "No User Found" });
    }
    const data = {
      success: true,
      message: "User Details Found!",
      user,
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export default { register, login, logout, changepassword, forgotpassword, sendotp, verifyotp, sendCredentialsEmail, deleteUser, AuthenticatedUsers, FilteredAuthenticatedUsers };