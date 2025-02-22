import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { rows } = await pool.query("SELECT * FROM Users WHERE email = $1", [credentials?.email]);
        const user = rows[0];
        if (user && user.password === credentials?.password) { // Replace with proper hashing in production
          return { id: user.id, email: user.email, role: user.role };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as string;
      return session;
    },
  },
});