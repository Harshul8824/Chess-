const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema({
    name : {
        type : String,
        required : [true, "Please tell us your name"],
        trim : true,
        minLength : [2, "name too short"],
        maxLength : [50, "name too long"]
    },
    email : {
        type : String,
        required : [true, "Please tell us your email"],
        unique : true,
        lowercase : true,
        trim : true,
        validate : function (value) {
            return validator.isEmail(value);
        },
        message : "Invalid email format"
    },
    password : {
        required : [true, 'pass is required'],
        minLength : [8, 'pass must at least 8 len'],
        select : false   // never returned in queries by default
    },
    username : {
        type : String,
        unique : true,
        sparse : true,  // allows multiple null values
        trim : true,
        lowercase : true,
        minLength : [3, 'Username too short'],
        maxLength : [20, 'Username too long'],
    },

    avatar : {
        type : String,  // URL to profile image (Cloudinary / S3)
        default : ""
    },
    phone : {
        type : String,
        default : null
    },
    // ─── ROLE & PERMISSIONS ───────────────────────
    role : {
        type : String,
        enum : ['user', 'admin', 'moderator'],
        default : 'user'
    },
    permissions : { // fine-grained control e.g. ['edit_post', 'delete_user']
        type : [String],
        default : []
    },
    // ─── ACCOUNT STATUS ───────────────────────────
    isActive : {
        type : Boolean,
        default : true // admin can deactivate account
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    bannedReason: {
      type: String,
      default: null,
    },

    // ─── AUTH & SECURITY ──────────────────────────
    refreshToken: {
      type: String,
      select: false,        // never exposed in responses
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpiry: {
      type: Date,
      select: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpiry: {
      type: Date,
      select: false,
    },

    passwordChangedAt: {
      type: Date,           // used to invalidate old JWTs after password change
    },

    // ─── LOGIN TRACKING ───────────────────────────
    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,           // brute-force protection
    },

    lockUntil: {
      type: Date,
      default: null,        // account locked after X failed attempts
    },

    // ─── OAUTH / SOCIAL LOGIN ─────────────────────
    googleId: {
      type: String,
      default: null,
    },

    githubId: {
      type: String,
      default: null,
    },

    // ─── PREFERENCES ─────────────────────────────
    preferences: {
      theme:        { type: String, enum: ['light', 'dark'], default: 'light' },
      language:     { type: String, default: 'en' },
      notifications:{ type: Boolean, default: true },
    },

// Chess-specific fields
chessProfile: {
  rating:       { type: Number, default: 1200 },   // ELO rating
  gamesPlayed:  { type: Number, default: 0 },
  wins:         { type: Number, default: 0 },
  losses:       { type: Number, default: 0 },
  draws:        { type: Number, default: 0 },
  title: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Master', 'GrandMaster'],
    default: 'Beginner',
  },
},

friends : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

activeGame: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', default: null },

},

  {
    timestamps: true,       // auto adds createdAt & updatedAt
  },
)

userSchema.index({email : 1});
userSchema.index({username : 1});
userSchema.index({role : 1});

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = Date.now();
    next();
});

//--------------Methods-----------------------
userSchema.methods.comparedPassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

//check jwt was issue before the password change
userSchema.methods.isPasswordChangedAfter = function (jwtIssuedAt){
    if(this.passwordChangedAt) {
        return this.passwordChangedAt.getTime() / 1000 > jwtIssuedAt;
    }
    return false;
};

//check if account is locked
userSchema.methods.isLocked = function () {
    return this.lockUntil && this.lockUntil > Date.now();
};

const User = mongoose.model('User', userSchema);
module.exports = User;