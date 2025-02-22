import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Pool } from "pg";
import { compare } from "bcrypt"; // For password hashing comparison

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { rows } = await pool.query("SELECT * FROM Users WHERE email = $1", [
          credentials.email,
        ]);
        const user = rows[0];

        if (!user || !user.isverified) return null;

        const isValid = await compare(credentials.password, user.password); // Assumes hashed passwords
        if (!isValid) return null;

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to role-specific dashboard after login
      const role = url.split("role=")[1] || "employer"; // Fallback to employer
      return `${baseUrl}/dashboard/${role}`;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", // Redirect to login on error
  },
  secret: process.env.NEXTAUTH_SECRET,
});