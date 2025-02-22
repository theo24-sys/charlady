import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    
    <div className="min-h-screen bg-softPink flex flex-col items-center">
      <header className="w-full bg-pastelPurple py-6 text-center">
        <h1 className="text-4xl font-semibold text-white">CHARLADY Kenya</h1>
        <p className="text-lg text-warmPeach mt-2">
          Connecting trusted housekeepers, mama fua and nannies with employers in Kenya
        </p>
      </header>

      <section className="py-12 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold text-pastelPurple text-center mb-8">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-warmPeach">Post Jobs</h3>
            <p className="text-gray-600 mt-2">
              Employers post nanny or housekeeping jobs easily.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-warmPeach">Apply Easily</h3>
            <p className="text-gray-600 mt-2">
              Housekeepers apply to jobs that suit them.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-warmPeach">Safe & Verified</h3>
            <p className="text-gray-600 mt-2">
              All users and jobs are admin-verified.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold text-pastelPurple text-center mb-8">
          A Glimpse of Our Community
        </h2>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <div className="relative w-full md:w-1/2 h-64">
            <Image
              src="/nanny1.webp"
              alt="Nanny caring for a child"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
          <div className="relative w-full md:w-1/2 h-64">
            <Image
              src="/housekeeper1.jpeg"
              alt="Housekeeper cleaning"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      <section className="py-12 text-center">
        <h2 className="text-2xl font-semibold text-pastelPurple mb-4">
          Ready to Get Started?
        </h2>
        <div className="flex justify-center gap-4">
          <Link href="/register">
            <button className="bg-warmPeach text-white px-6 py-3 rounded-full hover:bg-pastelPurple transition-colors">
              Sign Up
            </button>
          </Link>
          <Link href="/login">
            <button className="bg-pastelPurple text-white px-6 py-3 rounded-full hover:bg-warmPeach transition-colors">
              Log In
            </button>
          </Link>
        </div>
      </section>

      <footer className="w-full bg-pastelPurple py-4 text-center text-white">
        <p>© 2025 CHARLADY Kenya. All rights reserved.</p>
      </footer>
    </div>
  );
}