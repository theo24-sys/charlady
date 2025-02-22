import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      setError("Invalid credentials or account not verified.");
    } else {
      router.push("/dashboard/employer"); // NextAuth redirect will override this
    }
  };

  return (
    <div className="min-h-screen bg-softPink flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-semibold text-pastelPurple mb-6 text-center">
          Log In
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mt-1 border rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mt-1 border rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-warmPeach text-white py-2 rounded-full hover:bg-pastelPurple transition-colors"
          >
            Log In
          </button>
        </form>
        <p className="mt-4 text-center">
          Don’t have an account?{" "}
          <a href="/register" className="text-pastelPurple hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}