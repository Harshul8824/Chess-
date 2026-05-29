//create the funct =>
// signToken
// createSendToken
// signup
// login 
// logout
// updatePassword
// protect
// isLoggedIn
// restrictTo
// forgetPassword
// resetPassword

import crypto        from 'crypto';
import User          from '../models/userModel.js';
import AppError      from '../Utils/AppError.js';
import { sendTokenResponse, generateAccessToken } from '../utils/jwt.utils.js';
import { sendEmail } from '../utils/email.utils.js';
import jwt           from 'jsonwebtoken';

// ════════════════════════════════════════════════════
//  @desc    Register new user
//  @route   POST /api/v1/auth/register
//  @access  Public
// ════════════════════════════════════════════════════

export const register = async (req, res, next) => {
        try{
           const {name, email, password, username} = req.body;   

           // 1. Check required fields
           if(!name || !email || !password){
              return next(new AppError('Please provide name, email and password', 400));
           }

           // 2. Check if user already exists
           const existingUser = User.findOne({email});

           if(existingUser) return next(new AppError('Email already registered', 400));

            // 3. Check username uniqueness if provided
            if(username){
                const existingUsername = User.find({username});
                if(existingUsername) return next(new AppError('Username already taken', 400));     
            }

            // 4. Create user (password hashed in model pre-save hook)
            const user = await User.create({name, email, password, username});

            // 5. Generate email verification token
            const verifyToken = crypto.randomBytes(32).toString('hex');
            user.emailVerificationToken = crypto
            .createHash('sha256')
            .update(verifyToken)
            .digest('hex');
            user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24hrs
            await user.save({ validateBeforeSave: false });

            // 6. Send verification email
            const verifyURL = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
            await sendEmail({
            to:      email,
            subject: 'Verify your Chess account ♟️',
            html: `
                <h2>Welcome to Chess App, ${name}!</h2>
                <p>Click below to verify your email. Link expires in 24 hours.</p>
                <a href="${verifyURL}" style="background:#1a73e8;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;display:inline-block;">
                Verify Email
                </a>
                <p>Or copy: ${verifyURL}</p>
            `,
            });
            // 7. Send tokens
            sendTokenResponse(res, user, 201);
        }catch(err){
            next(err);
        }
};

// ════════════════════════════════════════════════════
//  @desc    Login user
//  @route   POST /api/v1/auth/login
//  @access  Public
// ════════════════════════════════════════════════════
const login = async (req, res, next) =>{
    try{
        const {email, password} = req.body;

        // 1. Validate input
        if(!email || !password){
            return next(new AppError("Please provide email and password", 400));
        }

        //2. Find user with password (select: false by default)
        const user = User.findOne({email}).select('+password +loginAttemps +lockUntil');
        if(user?.isLocked()){
            const waitMins = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return next(new AppError(`Account locked. Try again in ${waitMins} minutes.`, 423));
        }
        // 4. Check user exists & password correct
        if(!user || !(await user.comparedPassword(password))){
            // Increment failed login attempts
            if (user) {
                user.loginAttempts += 1;

                // Lock after 5 failed attempts for 30 minutes
                if (user.loginAttempts >= 5) {
                user.lockUntil     = Date.now() + 30 * 60 * 1000;
                user.loginAttempts = 0;
                }
                await user.save({ validateBeforeSave: false });
            }
            return next(new AppError('Invalid email or password', 401));
        }
        // 5. Check if account is active
        if (!user.isActive)
        return next(new AppError('Your account has been deactivated. Contact support.', 403));

        // 6. Check if account is banned
        if (user.isBanned)
        return next(new AppError(`Account banned: ${user.bannedReason || 'Policy violation'}`, 403));

        // 7. Reset login attempts on success
        if (user.loginAttempts > 0) {
        user.loginAttempts = 0;
        user.lockUntil     = null;
        }

        // 8. Update last login
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        // 9. Send tokens
        sendTokenResponse(res, user);
}
catch(err) {
    next(err);
 }
};

// ════════════════════════════════════════════════════
//  @desc    Logout user
//  @route   POST /api/v1/auth/logout
//  @access  Private
// ════════════════════════════════════════════════════

export const logout = async (req, res, next) => {
  try {
    // Clear refresh token from DB
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });

  } catch (err) { next(err); }
};

// ════════════════════════════════════════════════════
//  @desc    Get current logged in user
//  @route   GET /api/v1/auth/me
//  @access  Private
// ════════════════════════════════════════════════════
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({ success: true, user });

  } catch (err) { next(err); }
};

// ════════════════════════════════════════════════════
//  @desc    Refresh access token
//  @route   POST /api/v1/auth/refresh-token
//  @access  Public (uses refresh token cookie)
// ════════════════════════════════════════════════════
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return next(new AppError('No refresh token', 401));

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('User not found', 401));

    // Issue new access token
    const accessToken = generateAccessToken(user._id);

    res.status(200).json({ success: true, accessToken });

  } catch (err) {
    next(new AppError('Invalid or expired refresh token', 401));
  }
};

// ════════════════════════════════════════════════════
//  @desc    Verify email
//  @route   GET /api/v1/auth/verify-email/:token
//  @access  Public
// ════════════════════════════════════════════════════
export const verifyEmail = async (req, res, next) => {
  try {
    // Hash the token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken:  hashedToken,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user)
      return next(new AppError('Invalid or expired verification link', 400));

    // Mark as verified
    user.isEmailVerified        = true;
    user.emailVerificationToken  = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Email verified successfully ✅' });

  } catch (err) { next(err); }
};

// ════════════════════════════════════════════════════
//  @desc    Forgot password
//  @route   POST /api/v1/auth/forgot-password
//  @access  Public
// ════════════════════════════════════════════════════
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new AppError('Please provide your email', 400));

    const user = await User.findOne({ email });

    // Always send success — don't reveal if email exists (security)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken  = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpiry = Date.now() + 10 * 60 * 1000;  // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to:      email,
      subject: 'Chess App — Password Reset (valid 10 mins)',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click below to reset your password. Expires in <strong>10 minutes.</strong></p>
        <a href="${resetURL}" style="background:#e53e3e;color:#fff;padding:12px 24px;
        border-radius:6px;text-decoration:none;display:inline-block;">
          Reset Password
        </a>
        <p>Ignore this email if you didn't request a reset.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });

  } catch (err) { next(err); }
};

// ════════════════════════════════════════════════════
//  @desc    Reset password
//  @route   PATCH /api/v1/auth/reset-password/:token
//  @access  Public
// ════════════════════════════════════════════════════
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return next(new AppError('Please provide a new password', 400));

    // Hash token and find user
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken:  hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    });

    if (!user) return next(new AppError('Invalid or expired reset token', 400));

    // Update password (pre-save hook hashes it)
    user.password            = password;
    user.passwordResetToken  = undefined;
    user.passwordResetExpiry = undefined;
    user.loginAttempts       = 0;
    user.lockUntil           = null;
    await user.save();

    // Log user in immediately
    sendTokenResponse(res, user);

  } catch (err) { next(err); }
};

// ════════════════════════════════════════════════════
//  @desc    Change password (logged in user)
//  @route   PATCH /api/v1/auth/change-password
//  @access  Private
// ════════════════════════════════════════════════════
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return next(new AppError('Please provide current and new password', 400));

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    if (!(await user.comparePassword(currentPassword)))
      return next(new AppError('Current password is incorrect', 401));

    // Prevent reusing same password
    if (await user.comparePassword(newPassword))
      return next(new AppError('New password cannot be same as current password', 400));

    // Update password
    user.password = newPassword;
    await user.save();

    sendTokenResponse(res, user);

  } catch (err) { next(err); }
};