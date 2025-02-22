import { useSession, signOut } from "next-auth/react";

export default function HousekeeperDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated" || session?.user.role !== "housekeeper") {
    return <p className="text-center mt-10">Access Denied</p>;
  }

  return (
    <div className="min-h-screen bg-softPink p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-pastelPurple">
            Housekeeper Dashboard
          </h1>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-warmPeach text-white px-4 py-2 rounded-full hover:bg-pastelPurple"
          >
            Log Out
          </button>
        </div>
        <p>Welcome, {session.user.email}!</p>
        {/* TODO: Add job listings */}
      </div>
    </div>
  );
}
// Add after useState declarations:
const [applications, setApplications] = useState<any[]>([]);

useEffect(() => {
  const fetchApplications = async () => {
    const { rows } = await query(
      "SELECT a.*, j.title FROM Applications a JOIN Jobs j ON a.jobId = j.id WHERE a.housekeeperId = $1",
      [session.user.id]
    );
    setApplications(rows);
  };
  if (session) fetchApplications();
}, [session]);
// Add to useState declarations:
const [locationFilter, setLocationFilter] = useState("");
const [salaryMin, setSalaryMin] = useState("");
const [salaryMax, setSalaryMax] = useState("");

// Update fetchJobs in useEffect:
const fetchJobs = async () => {
  try {
    let sql = "SELECT * FROM Jobs WHERE isVerified = TRUE";
    const params: any[] = [];
    if (locationFilter) {
      sql += " AND location ILIKE $1";
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
    const { rows } = await query(sql, params);
    setJobs(rows);
  } catch (err) {
    setError("Failed to load jobs.");
  }
};

// Add filter form before the job listings in the return:
<div className="mb-6 bg-white p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-pastelPurple mb-4">Filter Jobs</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    onClick={fetchJobs}
    className="mt-4 bg-warmPeach text-white px-4 py-2 rounded-full hover:bg-pastelPurple"
  >
    Apply Filters
  </button>
</div>
// Add after the job listings in the return:
<div className="mt-8 bg-white p-6 rounded-lg shadow-md">
  <h2 className="text-2xl font-semibold text-pastelPurple mb-4">Your Applications</h2>
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