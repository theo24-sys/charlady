import { useSession, signOut } from "next-auth/react";

export default function EmployerDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated" || session?.user.role !== "employer") {
    return <p className="text-center mt-10">Access Denied</p>;
  }

  return (
    <div className="min-h-screen bg-softPink p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-pastelPurple">
            Employer Dashboard
          </h1>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-warmPeach text-white px-4 py-2 rounded-full hover:bg-pastelPurple"
          >
            Log Out
          </button>
        </div>
        <p>Welcome, {session.user.email}!</p>
        {/* TODO: Add job posting form */}
      </div>
    </div>
  );
}
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
    } catch (err) {
      setError("Failed to post job. Please try again.");
    }
  };import { rateLimit } from "../../lib/rateLimit";

  // Inside handleSubmit, before the query:
  const { allowed, retryAfter } = await rateLimit(session.user.id, 5, 3600); // 5 requests per hour
  if (!allowed) {
    setError(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    return;
  }
  // Add after useState declarations:
const [postedJobs, setPostedJobs] = useState<any[]>([]);

useEffect(() => {
  const fetchJobs = async () => {
    const { rows } = await query("SELECT * FROM Jobs WHERE employerId = $1", [
      session.user.id,
    ]);
    setPostedJobs(rows);
  };
  if (session) fetchJobs();
}, [session]);

// Add after the form in the return:
<div className="mt-8 bg-white p-6 rounded-lg shadow-md">
  <h2 className="text-2xl font-semibold text-pastelPurple mb-4">Your Posted Jobs</h2>
  {postedJobs.length === 0 ? (
    <p>No jobs posted yet.</p>
  ) : (
    <ul className="space-y-4">
      {postedJobs.map((job) => (
        <li key={job.id} className="border p-4 rounded-md">
          <h3 className="text-xl font-semibold text-warmPeach">{job.title}</h3>
          <p>Status: {job.status}{job.isverified ? " (Verified)" : " (Pending Verification)"}</p>
          <p>{job.description}</p>
        </li>
      ))}
    </ul>
  )}
</div>
