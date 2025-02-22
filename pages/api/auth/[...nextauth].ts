import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt"; 
import { pool } from "../../../lib/db"; // Use a shared DB connection

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@mail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Both email and password are required.");
        }

        try {
          const { rows } = await pool.query("SELECT * FROM Users WHERE email = $1", [
            credentials.email,
          ]);

          const user = rows[0];
          if (!user) throw new Error("No user found with this email.");
          if (!user.is_verified) throw new Error("Please verify your email before logging in.");

          const isValid = await compare(credentials.password, user.password);
          if (!isValid) throw new Error("Invalid credentials.");

          return { id: user.id, email: user.email, role: user.role };
        } catch (error) {
          throw new Error("Authentication failed.");
        }
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
      session.user = {
        id: token.id,
        email: token.email,
        role: token.role,
      };
      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login?error=true", // Pass error state
  },
  secret: process.env.NEXTAUTH_SECRET,
});
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Pool } from "pg";
import { compare } from "bcrypt";

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

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return { id: user.id, email: user.email, role: user.role, name: user.name };
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
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.name = token.name as string;
      return session;
    },
    async redirect({ url, baseUrl }) {
      const role = url.split("role=")[1] || "employer";
      return `${baseUrl}/dashboard/${role}`;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});