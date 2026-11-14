// הגדרות Next.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // הלקוח של Turso כולל קוד שלא אמור לעבור דרך ה-bundler, אז הוא נטען כמו שהוא בשרת
  serverExternalPackages: ["@libsql/client"],
  images: { unoptimized: true },
  agentRules: false,
};
export default nextConfig;
