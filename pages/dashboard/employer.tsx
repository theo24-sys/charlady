import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { query } from "../../lib/db";
import ProfileEdit from "../../components/ProfileEdit";
import { rateLimit } from "../../lib/rateLimit";

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: string | null;
  status: string;
  isverified: boolean;
}

export default function EmployerDashboard() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!session) return;
      try {
        const { rows } = await query("SELECT * FROM Jobs WHERE employerId = $1", [
          session.user.id,
        ]);
        setPostedJobs(rows);
      } catch (err) {
        setError("Failed to fetch jobs.");
      }
    };
    if (session) fetchJobs();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (title.length < 3) {
      setError("Job title must be at least 3 characters.");
      return;
    }
    if (description.length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }
    if (!/^[a-zA-Z\s,.-]+$/.test(location)) {
      setError("Location must contain only letters, spaces, commas, periods, or hyphens.");
      return;
    }
    if (salary && (isNaN(Number(salary)) || Number(salary) < 0)) {
      setError("Salary must be a positive number.");
      return;
    }

    if (session) {
      const { allowed, retryAfter } = await rateLimit(session.user.id, 5, 3600);
      if (!allowed) {
        setError(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
        return;
      }
    }

    try {
      await query(
        "INSERT INTO Jobs (employerId, title, description, location, salary) VALUES ($1, $2, $3, $4, $5)",
        [session?.user.id, title, description, location, salary || null]
      );
      setSuccess("Job posted successfully! Awaiting admin verification.");
      setTitle("");
      setDescription("");
      setLocation("");
      setSalary("");
    } catch (err) {
      setError("Failed to post job. Please try again.");
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated" || session?.user.role !== "employer") {
    return <p className="text-center mt-10">Access Denied</p>;
  }

  return (
    <div className="min-h-screen bg-softPink p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-pastelPurple">Employer Dashboard</h1>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-warmPeach text-white px-4 py-2 rounded-full hover:bg-pastelPurple"
          >
            Log Out
          </button>
        </div>
        <p>Welcome, {session?.user.email}!</p>

        {/* Job Posting Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          <div className="mb-4">
            <label className="block text-gray-700">Job Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Salary (optional):</label>
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="bg-pastelPurple text-white px-4 py-2 rounded-full hover:bg-warmPeach"
          >
            Post Job
          </button>
        </form>

        {/* Posted Jobs List */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-pastelPurple mb-4">Your Posted Jobs</h2>
          {postedJobs.length === 0 ? (
            <p>No jobs posted yet.</p>
          ) : (
            <ul className="space-y-4">
              {postedJobs.map((job) => (
                <li key={job.id} className="border p-4 rounded-md">
                  <h3 className="text-xl font-semibold text-warmPeach">{job.title}</h3>
                  <p>Status: {job.status} {job.isverified ? "(Verified)" : "(Pending Verification)"}</p>
                  <p>{job.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { query } from "../../lib/db";
import ProfileEdit from "../../components/ProfileEdit";
import { rateLimit } from "../../lib/rateLimit";

export default function EmployerDashboard() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [postedJobs, setPostedJobs] = useState<any[]>([]);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated" || session?.user.role !== "employer") {
    return <p className="text-center mt-10">Access Denied</p>;
  }

  const fetchJobs = async () => {
    const { rows } = await query("SELECT * FROM Jobs WHERE employerId = $1", [
      session.user.id,
    ]);
    setPostedJobs(rows);
  };

  useEffect(() => {
    if (session) fetchJobs();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (title.length < 3) {
      setError("Job title must be at least 3 characters.");
      return;
    }
    if (description.length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }
    if (!/^[a-zA-Z\s,.-]+$/.test(location)) {
      setError("Location must contain only letters, spaces, commas, periods, or hyphens.");
      return;
    }
    if (salary && (isNaN(Number(salary)) || Number(salary) < 0)) {
      setError("Salary must be a positive number.");
      return;
    }

    const { allowed, retryAfter } = await rateLimit(session.user.id, 5, 3600);
    if (!allowed) {
      setError(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
      return;
    }

    try {
      await query(
        "INSERT INTO Jobs (employerId, title, description, location, salary) VALUES ($1, $2, $3, $4, $5)",
        [session.user.id, title, description, location, salary || null]
      );
      setSuccess("Job posted successfully! Awaiting admin verification.");
      setTitle("");
      setDescription("");
      setLocation("");
      setSalary("");
      fetchJobs();
    } catch (err) {
      setError("Failed to post job. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-softPink p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-pastelPurple">
            Employer Dashboard
          </h1>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 md:mt-0 bg-warmPeach text-white px-4 py-2 rounded-full hover:bg-pastelPurple"
          >
            Log Out
          </button>
        </div>
        <p className="mb-6">Welcome, {session.user.email}!</p>

        {/* Profile Edit */}
        <ProfileEdit
          initialName={session.user.name || ""}
          initialEmail={session.user.email}
          onUpdate={fetchJobs} // Refresh not needed here, but keeps API consistent
        />

        {/* Job Posting */}
        <div className="mt-8 bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-xl md:text-2xl font-semibold text-pastelPurple mb-4">
            Post a New Job
          </h2>
          {success && <p className="text-green-500 mb-4">{success}</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 mt-1 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 mt-1 border rounded-md"
                rows={4}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 mt-1 border rounded-md"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700">Salary (Optional)</label>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full p-2 mt-1 border rounded-md"
              />
            </div>
            <button
              type="submit"
              className="bg-warmPeach text-white px-6 py-2 rounded-full hover:bg-pastelPurple transition-colors"
            >
              Post Job
            </button>
          </form>
        </div>

        {/* Posted Jobs */}
        <div className="mt-8 bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-xl md:text-2xl font-semibold text-pastelPurple mb-4">
            Your Posted Jobs
          </h2>
          {postedJobs.length === 0 ? (
            <p>No jobs posted yet.</p>
          ) : (
            <ul className="space-y-4">
              {postedJobs.map((job) => (
                <li key={job.id} className="border p-4 rounded-md">
                  <h3 className="text-lg md:text-xl font-semibold text-warmPeach">{job.title}</h3>
                  <p>Status: {job.status}{job.isverified ? " (Verified)" : " (Pending Verification)"}</p>
                  <p>{job.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}