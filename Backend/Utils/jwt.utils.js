import jwt from 'jsonwebtoken';

export const generateAcessToken = (id) =>{
   jwt.sign({id}, process.env.JWT_ACCESS_SECRET, {
    expiresIn : process.env.JWT_ACCESS_EXPIRES || '15m',
   });
}

export const generateRefreshToken = (id) =>{
    jwt.sign({id}, process.env.JWT_REFRESH_SECRET, {
        expiresIn : process.env.JWT_REFRESH_EXPIRES || '7d',
    })
}

export const sendTokenResponse = (res, user, statusCode = 200) =>{
    const accessToken = generateAcessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    //store refresh token in http-only cookie
    res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,    // 7 days
    });

    //pass never send in res
    user.password = undefined;
    
  res.status(statusCode).json({
    success:     true,
    accessToken,
    user: {
      id:              user._id,
      name:            user.name,
      email:           user.email,
      role:            user.role,
      isEmailVerified: user.isEmailVerified,
      avatar:          user.avatar,
    },
  });
}