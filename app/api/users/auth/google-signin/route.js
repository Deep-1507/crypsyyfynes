
import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

import User from "../../../../../models/User";
import { connectDB } from "../../../../../lib/mongodb";

function publicUser(user) {
  const data = user.toObject();

  delete data.password;
  delete data.googleId;
  
  return data;
}

function createToken(user) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}


const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export async function POST(request) {
  try {
    await connectDB();

    const { credential } = await request.json();
      console.log("Reached here 1")

    if (!credential) {
      return NextResponse.json(
        {
          success: false,
          message: "Google credential is required",
        },
        { status: 400 }
      );
    }

    // Verify Google's ID token.
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

     console.log("Reached here 2")

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Google account verification failed",
        },
        { status: 401 }
      );
    }
     console.log(payload.email.toLowerCase())

  
    // Find an existing ShopSync account.
    const user = await User.findOne({
      email: payload.email.toLowerCase(),
    });

    console.log(user)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No ShopSync account found. Please register first.",
        },
        { status: 404 }
      );
    }

    // Generate your existing ShopSync JWT.
    const token = createToken(user);

    return NextResponse.json({
      success: true,
      message: "Signed in successfully with Google",
      token,
      data: publicUser(user),
    });

  } catch (error) {
    console.error("Google signin error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Google authentication failed",
      },
      { status: 401 }
    );
  }
}
