import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    res.json(users);
  } catch (err) {
    console.error("Users fetch failed", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ✅ GET USER BY ID
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("User fetch failed", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;
