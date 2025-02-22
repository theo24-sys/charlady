import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { query } from "../../lib/db";
import ProfileEdit from "../../components/ProfileEdit";
import { sendEmail } from "../../lib/email";

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: number | null;
  isVerified: boolean;
  employerId: number;
}

interface Application {
  id: number;
  jobId: number;
  housekeeperId: number;
  title: string;
}

export default function HousekeeperDashboard() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 5;

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated" || session?.user.role !== "housekeeper") {
    return <p className="text-center mt-10">Access Denied</p>;
  }

  const fetchJobs = async () => {
    try {
      let sql = "SELECT COUNT(*) as total FROM Jobs WHERE isVerified = TRUE";
      let params: any[] = [];

      if (locationFilter) {
        sql += " AND location ILIKE $" + (params.length + 1);
        params.push(`%${locationFilter}%`);
      }
      if (salaryMin) {
        sql += ` AND (salary >= $${params.length + 1} OR salary IS NULL)`;
        params.push(salaryMin);
      }
      if (salaryMax) {
        sql += ` AND (salary <= $${params.length + 1} OR salary IS NULL)`;
        params.push(salaryMax);
      }

      const { rows: countRows } = await query(sql, params);
      const totalJobs = parseInt(countRows[0].total);
      setTotalPages(Math.ceil(totalJobs / jobsPerPage));

      sql = sql.replace("COUNT(*) as total", "*") + ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(jobsPerPage, (page - 1) * jobsPerPage);

      const { rows } = await query(sql, params);
      setJobs(rows);
    } catch (err) {
      setError("Failed to load jobs.");
    }
  };

  useEffect(() => {
    if (session) {
      fetchJobs();
      const fetchApplications = async () => {
        const { rows } = await query(
          "SELECT a.*, j.title FROM Applications a JOIN Jobs j ON a.jobId = j.id WHERE a.housekeeperId = $1",
          [session.user.id]
        );
        setApplications(rows);
      };
      fetchApplications();
    }
  }, [session, page]);

  const handleApply = async (jobId: number) => {
    try {
      await query("INSERT INTO Applications (jobId, housekeeperId) VALUES ($1, $2)", [jobId, session?.user.id]);
      
      const { rows: job } = await query("SELECT title, employerId FROM Jobs WHERE id = $1", [jobId]);
      if (!job.length) throw new Error("Job not found.");
      
      const { rows: employer } = await query("SELECT email FROM Users WHERE id = $1", [job[0].employerId]);
      if (!employer.length) throw new Error("Employer not found.");
      
      await sendEmail(
        employer[0].email,
        "New Application",
        `A housekeeper has applied to your job \"${job[0].title}\". Check your dashboard for details.`
      );
      
      alert("Application submitted!");
      fetchJobs();
    } catch (err) {
      setError("Failed to apply. You may have already applied.");
    }
  };

  return (
    <div className="min-h-screen bg-softPink p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-pastelPurple">Housekeeper Dashboard</h1>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="bg-warmPeach text-white px-4 py-2 rounded-full hover:bg-pastelPurple">Log Out</button>
        </div>
        <p>Welcome, {session?.user.email}!</p>

        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-2xl font-semibold text-pastelPurple">Available Jobs</h2>
          {jobs.length === 0 ? <p>No jobs found.</p> : jobs.map(job => (
            <div key={job.id} className="border p-4 rounded-md mb-4">
              <h3 className="text-xl font-semibold text-warmPeach">{job.title}</h3>
              <p>{job.location} - {job.salary ? `$${job.salary}` : "Salary not specified"}</p>
              <button onClick={() => handleApply(job.id)} className="mt-2 bg-pastelPurple text-white px-4 py-2 rounded-full hover:bg-warmPeach">Apply</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { query } from "../../lib/db";
import ProfileEdit from "../../components/ProfileEdit";

export default function HousekeeperDashboard() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 5;

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated" || session?.user.role !== "housekeeper") {
    return <p className="text-center mt-10">Access Denied</p>;
  }

  const fetchJobs = async () => {
    try {
      let sql = "SELECT COUNT(*) as total FROM Jobs WHERE isVerified = TRUE";
      let params: any[] = [];
      if (locationFilter) {
        sql += " AND location ILIKE $" + (params.length + 1);
        params.push(`%${locationFilter}%`);
      }
      if (salaryMin) {
        sql += ` AND (salary >= $${params.length + 1} OR salary IS NULL)`;
        params.push(salaryMin);
      }
      if (salaryMax) {
        sql += ` AND (salary <= $${params.length + 1} OR salary IS NULL)`;
        params.push(salaryMax);
      }
      const { rows: countRows } = await query(sql, params);
      const totalJobs = parseInt(countRows[0].total);
      setTotalPages(Math.ceil(totalJobs / jobsPerPage));

      sql = sql.replace("COUNT(*) as total", "*") + ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(jobsPerPage, (page - 1) * jobsPerPage);
      const { rows } = await query(sql, params);
      setJobs(rows);
    } catch (err) {
      setError("Failed to load jobs.");
    }
  };

  const fetchApplications = async () => {
    const { rows } = await query(
      "SELECT a.*, j.title FROM Applications a JOIN Jobs j ON a.jobId = j.id WHERE a.housekeeperId = $1",
      [session.user.id]
    );
    setApplications(rows);
  };

  useEffect(() => {
    if (session) {
      fetchJobs();
      fetchApplications();
    }
  }, [session, page]);

  const handleApply = async (jobId: string) => {
    try {
      await query(
        "INSERT INTO Applications (jobId, housekeeperId) VALUES ($1, $2)",
        [jobId, session.user.id]
      );
      const { rows: job } = await query("SELECT title, employerId FROM Jobs WHERE id = $1", [jobId]);
      const { rows: employer } = await query("SELECT email FROM Users WHERE id = $1", [job[0].employerid]);
      await sendEmail(
        employer[0].email,
        "New Application",
        `A housekeeper has applied to your job "${job[0].title}". Check your dashboard for details.`
      );
      alert("Application submitted!");
      fetchJobs();
      fetchApplications();
    } catch (err) {
      setError("Failed to apply. You may have already applied.");
    }
  };

  return (
    <div className="min-h-screen bg-softPink p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-pastelPurple">
            Housekeeper Dashboard
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
          onUpdate={fetchApplications} // Refresh applications if email changes
        />

        {/* Filters */}
        <div className="mt-8 mb-6 bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-pastelPurple mb-4">Filter Jobs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700">Location</label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full p-2 mt-1 border rounded-md"
                placeholder="e.g., Nairobi"
              />
            </div>
            <div>
              <label className="block text-gray-700">Min Salary</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="w-full p-2 mt-1 border rounded-md"
                placeholder="e.g., 10000"
              />
            </div>
            <div>
              <label className="block text-gray-700">Max Salary</label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                className="w-full p-2 mt-1 border rounded-md"
                placeholder="e.g., 50000"
              />
            </div>
          </div>
          <button
            onClick={() => { setPage(1); fetchJobs(); }}
            className="mt-4 bg-warmPeach text-white px-4 py-2 rounded-full hover:bg-pastelPurple"
          >
            Apply Filters
          </button>
        </div>

        {/* Job Listings */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-xl md:text-2xl font-semibold text-pastelPurple mb-4">
            Available Jobs
          </h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {jobs.length === 0 ? (
            <p>No jobs available yet.</p>
          ) : (
            <>
              <ul className="space-y-4">
                {jobs.map((job) => (
                  <li key={job.id} className="border p-4 rounded-md">
                    <h3 className="text-lg md:text-xl font-semibold text-warmPeach">{job.title}</h3>
                    <p className="text-gray-600">{job.description}</p>
                    <p className="text-gray-600">Location: {job.location}</p>
                    <p className="text-gray-600">
                      Salary: {job.salary ? `KSh ${job.salary}` : "Not specified"}
                    </p>
                    <button
                      onClick={() => handleApply(job.id)}
                      className="mt-2 bg-pastelPurple text-white px-4 py-2 rounded-full hover:bg-warmPeach"
                    >
                      Apply
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-warmPeach text-white px-4 py-2 rounded-full disabled:bg-gray-300"
                >
                  Previous
                </button>
                <p>Page {page} of {totalPages}</p>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-warmPeach text-white px-4 py-2 rounded-full disabled:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* Applications */}
        <div className="mt-8 bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-xl md:text-2xl font-semibold text-pastelPurple mb-4">
            Your Applications
          </h2>
          {applications.length === 0 ? (
            <p>No applications yet.</p>
          ) : (
            <ul className="space-y-4">
              {applications.map((app) => (
                <li key={app.id} className="border p-4 rounded-md">
                  <p className="text-warmPeach font-semibold">{app.title}</p>
                  <p>Status: {app.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}