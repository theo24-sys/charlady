import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-softPink flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-pastelPurple text-center">
        Welcome to CHARLADY Kenya
      </h1>
      <p className="text-lg text-gray-700 mt-4 text-center max-w-2xl">
        Connecting trusted housekeepers, mama fua and nannies with employers in Kenya.
      </p>

      {/* Services Section */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {[
          { title: "Job Posting", desc: "Employers post nanny or housekeeping jobs easily." },
          { title: "Apply with Ease", desc: "Housekeepers apply to jobs that suit them." },
          { title: "Verified & Safe", desc: "All users and jobs are admin-verified." },
        ].map((service, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold text-warmPeach">{service.title}</h2>
            <p className="text-gray-700 mt-2">{service.desc}</p>
          </div>
        ))}
      </div>

      {/* Captivating Images */}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Image
          src="/nanny1.webp"
          alt="Nanny"
          width={300}
          height={200}
          className="rounded-lg"
          priority
        />
        <Image
          src="/housekeeper1.jpeg"
          alt="Housekeeper"
          width={300}
          height={200}
          className="rounded-lg"
          priority
        />
      </div>

      {/* Footer / Extra Section */}
      <h1 className="text-2xl md:text-4xl font-semibold text-white mt-10">
        Charlady Kenya
      </h1>
    </div>
  );
}
