import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { query } from "../../lib/db";
import { sendEmail } from "../../lib/email";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { rows: userRows } = await query("SELECT * FROM Users WHERE isVerified = FALSE");
        const { rows: jobRows } = await query("SELECT * FROM Jobs WHERE isVerified = FALSE");
        setUsers(userRows);
        setJobs(jobRows);
      } catch (err) {
        setError("Failed to load users or jobs.");
      }
    };

    if (status === "authenticated") fetchData();
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated" || session?.user.role !== "admin") {
    return <p className="text-center mt-10">Access Denied</p>;
  }

  const handleVerify = async (type: "user" | "job", id: string) => {
    try {
      const table = type === "user" ? "Users" : "Jobs";
      const { rows } = await query(
        `UPDATE ${table} SET isVerified = TRUE WHERE id = $1 RETURNING *`,
        [id]
      );
      const item = rows[0];

      if (type === "user") {
        setUsers(users.filter((u) => u.id !== id));
        await sendEmail(
          item.email,
          "Account Verified",
          "Your account has been verified! You can now log in to Nannies Kenya."
        );
      } else {
        setJobs(jobs.filter((j) => j.id !== id));
        const { rows: employer } = await query("SELECT email FROM Users WHERE id = $1", [
          item.employerid,
        ]);
        await sendEmail(
          employer[0].email,
          "Job Verified",
          `Your job posting "${item.title}" has been verified and is now live.`
        );
      }
    } catch (err) {
      setError(`Failed to verify ${type}.`);
    }
  };

  return (
    <div className="min-h-screen bg-softPink p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-pastelPurple">Admin Dashboard</h1>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-warmPeach text-white px-4 py-2 rounded-full hover:bg-pastelPurple"
          >
            Log Out
          </button>
        </div>
        <p>Welcome, {session.user.email}!</p>

        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unverified Users Section */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-warmPeach">Unverified Users</h2>
            {users.length === 0 ? (
              <p>No users pending verification.</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex justify-between p-2 border-b">
                  <span>{user.email}</span>
                  <button
                    onClick={() => handleVerify("user", user.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-md"
                  >
                    Verify
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Unverified Jobs Section */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-warmPeach">Unverified Jobs</h2>
            {jobs.length === 0 ? (
              <p>No jobs pending verification.</p>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="flex justify-between p-2 border-b">
                  <span>{job.title}</span>
                  <button
                    onClick={() => handleVerify("job", job.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-md"
                  >
                    Verify
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
