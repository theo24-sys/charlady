import { useState } from "react";
import { query } from "../lib/db";
import { useSession } from "next-auth/react";

interface ProfileEditProps {
  initialName: string;
  initialEmail: string;
  onUpdate: () => void; // Callback to refresh dashboard data
}

export default function ProfileEdit({ initialName, initialEmail, onUpdate }: ProfileEditProps) {
  const { data: session } = useSession();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!/^[a-zA-Z\s]{2,}$/.test(name)) {
      setError("Name must be at least 2 characters and contain only letters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format.");
      return;
    }

    try {
      await query(
        "UPDATE Users SET name = $1, email = $2 WHERE id = $3",
        [name, email, session?.user.id]
      );
      setSuccess("Profile updated successfully!");
      onUpdate(); // Trigger parent to refresh data
    } catch (err) {
      setError("Failed to update profile. Email might already exist.");
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <h2 className="text-xl md:text-2xl font-semibold text-pastelPurple mb-4">
        Edit Profile
      </h2>
      {success && <p className="text-green-500 mb-4">{success}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mt-1 border rounded-md"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-1 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-warmPeach text-white px-4 py-2 rounded-full hover:bg-pastelPurple transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}