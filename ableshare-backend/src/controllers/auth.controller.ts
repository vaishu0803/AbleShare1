import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

// ================= REGISTER =================
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return res.status(201).json({
      message: "Registration successful. Please login.",
      user,
    });
  } catch (err) {
  console.error("REGISTER ERROR:", err);
  return res.status(500).json({ message: "Server error" });
}

};

// ================= LOGIN =================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});


    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
 } catch (err) {
  console.error("LOGIN ERROR:", err);
  return res.status(500).json({ message: "Server error" });
}

};

// ================= GET ME =================
export const getMe = async (
  req: Request & { user?: { id: number } },
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGOUT =================
export const logout = (_req: Request, res: Response) => {
 res.clearCookie("token", {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});

  return res.json({ message: "Logged out successfully" });
};
