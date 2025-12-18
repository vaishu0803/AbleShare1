import { hashPassword, comparePassword } from "../utils/hash";



type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

// TEMP in-memory store
const users: User[] = [];
let userIdCounter = 1;

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);

  const newUser: User = {
    id: userIdCounter++,
    name,
    email,
    password: hashedPassword,
  };

  users.push(newUser);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = users.find((u) => u.email === email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

