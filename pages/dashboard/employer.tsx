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