import { useState } from "react";
import { query } from "../lib/db";
import { useSession } from "next-auth/react";
import { hash, compare } from "bcrypt";

interface ProfileEditProps {
  initialName: string;
  initialEmail: string;
  onUpdate: () => void;
}

export default function ProfileEdit({ initialName, initialEmail, onUpdate }: ProfileEditProps) {
  const { data: session } = useSession();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
      onUpdate();
    } catch (err) {
      setError("Failed to update profile. Email might already exist.");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      const { rows } = await query("SELECT password FROM Users WHERE id = $1", [session?.user.id]);
      const isValid = await compare(currentPassword, rows[0].password);
      if (!isValid) {
        setError("Current password is incorrect.");
        return;
      }

      const hashedPassword = await hash(newPassword, 10);
      await query("UPDATE Users SET password = $1 WHERE id = $2", [hashedPassword, session?.user.id]);
      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Failed to update password.");
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <h2 className="text-xl md:text-2xl font-semibold text-pastelPurple mb-4">Edit Profile</h2>
      {success && <p className="text-green-500 mb-4">{success}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Profile Form */}
      <form onSubmit={handleProfileSubmit} className="mb-6">
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
          Save Profile Changes
        </button>
      </form>

      {/* Password Form */}
      <h3 className="text-lg md:text-xl font-semibold text-pastelPurple mb-4">Change Password</h3>
      <form onSubmit={handlePasswordSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 mt-1 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 mt-1 border rounded-md"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 mt-1 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-warmPeach text-white px-4 py-2 rounded-full hover:bg-pastelPurple transition-colors"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}