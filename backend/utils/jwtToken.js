export const generateToken = (user, message, statusCode, res) => {
  try {
    const token = user.generateJsonWebToken();
    
    // Ensure COOKIE_EXPIRE is a valid number
    const cookieExpire = parseInt(process.env.COOKIE_EXPIRE, 10);

    if (isNaN(cookieExpire)) {
      throw new Error("Invalid COOKIE_EXPIRE value in environment variables.");
    }

    // Determine the cookie name based on the user's role
    const cookieName = user.role === 'Admin' ? 'adminToken' : 'patientToken';

    // Set the cookie with the specified expiration time
    res
      .status(statusCode)
      .cookie(cookieName, token, {
        expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
        httpOnly: true, //xrf attack prevention
        secure: process.env.NODE_ENV === 'production',  // Secure flag for production
        sameSite: 'Strict',  //Prevents CSRF attacks
      })
      .json({
        success: true,
        message,
        user: {
          id: user.id,
          role: user.role,
          // Add other relevant user fields here
        },
        token, // Optionally, include the token in the response if needed
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
