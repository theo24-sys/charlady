import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-softPink flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold text-pastelPurple">Welcome to Nannies Kenya</h1>
      <p className="text-lg text-gray-700 mt-4">Connecting trusted housekeepers and nannies with employers in Kenya.</p>
      
      {/* Services Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-warmPeach">Job Posting</h2>
          <p>Employers post nanny or housekeeping jobs easily.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-warmPeach">Apply with Ease</h2>
          <p>Housekeepers apply to jobs that suit them.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-warmPeach">Verified & Safe</h2>
          <p>All users and jobs are admin-verified.</p>
        </div>
      </div>

      {/* Captivating Images */}
      <div className="mt-10 flex gap-4">
        <Image src="/nanny1.jpg" alt="Nanny" width={300} height={200} className="rounded-lg" />
        <Image src="/housekeeper1.jpg" alt="Housekeeper" width={300} height={200} className="rounded-lg" />
      </div>
    </div>
  );
}