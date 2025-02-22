import { useState } from "react";
import { hash } from "bcrypt";
import { useRouter } from "next/router";
import { query } from "../lib/db";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState<"employer" | "housekeeper">("employer");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Basic validation
        if (!/^[a-zA-Z\s]{2,}$/.test(name)) {
            setError("Name must be at least 2 characters and contain only letters.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Invalid email format.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        try {
            const hashedPassword = await hash(password, 10); // Hash password with bcrypt
            await query(
                "INSERT INTO Users (email, password, name, role) VALUES ($1, $2, $3, $4)",
                [email, hashedPassword, name, role]
            );
            router.push("/login"); // Redirect to login after registration
        } catch (err) {
            setError("Registration failed. Email might already exist.");
        }
    };

    return (
        <div className="min-h-screen bg-softPink flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-semibold text-pastelPurple mb-6 text-center">
                    Register
                </h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700">Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 mt-1 border rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 mt-1 border rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 mt-1 border rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="role" className="block text-gray-700">I am a:</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as "employer" | "housekeeper")}
                            className="w-full p-2 mt-1 border rounded-md"
                        >
                            <option value="employer">Employer</option>
                            <option value="housekeeper">Housekeeper</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-warmPeach text-white py-2 rounded-full hover:bg-pastelPurple transition-colors"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Already have an account?{" "}
                    <a href="/login" className="text-pastelPurple hover:underline">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
}