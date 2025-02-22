import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Pool } from "pg";
import { compare } from "bcrypt";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Define a User type for TypeScript
interface User {
  id: number;
  email: string;
  password: string;
  role: string;
  name: string;
  isverified: boolean;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const { rows } = await pool.query<User>("SELECT * FROM Users WHERE email = $1", [
            credentials.email,
          ]);
          const user = rows[0];

          if (!user || !user.isverified) return null;

          const isValid = await compare(credentials.password, user.password);
          if (!isValid) return null;

          return { id: String(user.id), email: user.email, role: user.role, name: user.name };
        } catch (error) {
          console.error("Error querying the database:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const role = new URL(url).searchParams.get("role") || "employer"; // Default to 'employer'
      return `${baseUrl}/dashboard/${role}`;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);