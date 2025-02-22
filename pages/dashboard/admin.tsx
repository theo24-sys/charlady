import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { query } from "../../lib/db";
import { sendEmail } from "../../lib/email";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    unverifiedUsers: 0,
    unverifiedJobs: 0,
    pendingApplications: 0,
  });
  const [error, setError] = useState("");

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated" || session?.user.role !== "admin") {
    return <p className="text-center mt-10">Access Denied</p>;
  }

  const fetchData = async () => {
    try {
      const { rows: userRows } = await query("SELECT * FROM Users WHERE isVerified = FALSE");
      const { rows: jobRows } = await query("SELECT * FROM Jobs WHERE isVerified = FALSE");
      setUsers(userRows);
      setJobs(jobRows);

      const { rows: analyticsRows } = await query(`
        SELECT 
          (SELECT COUNT(*) FROM Users) as totalUsers,
          (SELECT COUNT(*) FROM Jobs) as totalJobs,
          (SELECT COUNT(*) FROM Applications) as totalApplications,
          (SELECT COUNT(*) FROM Users WHERE isVerified = FALSE) as unverifiedUsers,
          (SELECT COUNT(*) FROM Jobs WHERE isVerified = FALSE) as unverifiedJobs,
          (SELECT COUNT(*) FROM Applications WHERE status = 'pending') as pendingApplications
      `);
      setAnalytics(analyticsRows[0]);
    } catch (err) {
      setError("Failed to load data.");
    }
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const handleVerify = async (type: "user" | "job", id: string) => {
    try {
      const table = type === "user" ? "Users" : "Jobs";
      const { rows } = await query(`UPDATE ${table} SET isVerified = TRUE WHERE id = $1 RETURNING *`, [id]);
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
        const { rows: employer } = await query("SELECT email FROM Users WHERE id = $1", [item.employerid]);
        await sendEmail(
          employer[0].email,
          "Job Verified",
          `Your job posting "${item.title}" has been verified and is now live.`
        );
      }
      fetchData(); // Refresh analytics
    } catch (err) {
      setError(`Failed to verify ${type}.`);
    }
  };

  return (
    <div className="min-h-screen bg-softPink p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-pastelPurple">
            Admin Dashboard
          </h1>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 md:mt-0 bg-warmPeach text-white px-4 py-2 rounded-full hover:bg-pastelPurple"
          >
            Log Out
          </button>
        </div>
        <p className="mb-6">Welcome, {session.user.email}!</p>

        {/* Analytics */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-pastelPurple mb-4">Analytics</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-softPink rounded-md">
              <p className="text-lg font-semibold text-warmPeach">Total Users</p>
              <p className="text-2xl">{analytics.totalUsers}</p>
            </div>
            <div className="p-4 bg-softPink rounded-md">
              <p className="text-lg font-semibold text-warmPeach">Total Jobs</p>
              <p className="text-2xl">{analytics.totalJobs}</p>
            </div>
            <div className="p-4 bg-softPink rounded-md">
              <p className="text-lg font-semibold text-warmPeach">Total Applications</p>
              <p className="text-2xl">{analytics.totalApplications}</p>
            </div>
            <div className="p-4 bg-softPink rounded-md">
              <p className="text-lg font-semibold text-warmPeach">Unverified Users</p>
              <p className="text-2xl">{analytics.unverifiedUsers}</p>
            </div>
            <div className="p-4 bg-softPink rounded-md">
              <p className="text-lg font-semibold text-warmPeach">Unverified Jobs</p>
              <p className="text-2xl">{analytics.unverifiedJobs}</p>
            </div>
            <div className="p-4 bg-softPink rounded-md">
              <p className="text-lg font-semibold text-warmPeach">Pending Applications</p>
              <p className="text-2xl">{analytics.pendingApplications}</p>
            </div>
          </div>
        </div>

        {/* Unverified Users */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-pastelPurple mb-4">
            Unverified Users
          </h2>
          {users.length === 0 ? (
            <p>No users to verify.</p>
          ) : (
            <ul className="space-y-4">
              {users.map((user) => (
                <li key={user.id} className="flex flex-col sm:flex-row justify-between items-center border p-4 rounded-md">
                  <div>
                    <p>{user.email} ({user.role})</p>
                    <p>Name: {user.name}</p>
                  </div>
                  <button
                    onClick={() => handleVerify("user", user.id)}
                    className="mt-2 sm:mt-0 bg-pastelPurple text-white px-4 py-2 rounded-full hover:bg-warmPeach"
                  >
                    Verify
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Unverified Jobs */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-xl md:text-2xl font-semibold text-pastelPurple mb-4">
            Unverified Jobs
          </h2>
          {jobs.length === 0 ? (
            <p>No jobs to verify.</p>
          ) : (
            <ul className="space-y-4">
              {jobs.map((job) => (
                <li key={job.id} className="flex flex-col sm:flex-row justify-between items-center border p-4 rounded-md">
                  <div>
                    <p className="text-warmPeach font-semibold">{job.title}</p>
                    <p>{job.description}</p>
                    <p>Location: {job.location}</p>
                  </div>
                  <button
                    onClick={() => handleVerify("job", job.id)}
                    className="mt-2 sm:mt-0 bg-pastelPurple text-white px-4 py-2 rounded-full hover:bg-warmPeach"
                  >
                    Verify
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}