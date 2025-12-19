import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (pwd: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/~`]).{8,}$/;

    if (!regex.test(pwd)) {
      setPasswordError(
        "Password must be 8+ chars, include uppercase, lowercase, number & special symbol."
      );
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 3) {
      alert("Name should be at least 3 characters 😄");
      return;
    }

    if (!email.includes("@")) {
      alert("Enter a valid email please 🙂");
      return;
    }

    if (!validatePassword(password)) {
      alert("Password is too weak 😅 Please make it stronger.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration successful 🎉 Please login.");
      navigate("/login");
    } catch (err) {
      alert("Something went wrong 😥 Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join AbleShare to collaborate better"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            required
            className="w-full border rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {passwordError && (
          <p className="text-red-600 text-sm mt-1">{passwordError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className=" w-full  bg-green-600 hover:bg-green-700   text-white   py-2 rounded-lg   transition "
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-sm text-center mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-green-600 font-medium">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
