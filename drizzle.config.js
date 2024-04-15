const env = process.env;

export default {
  schema: "./app/utils/types/db/*.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    user: env.PGUSER,
    password: env.PGPASSWORD,
    database: env.PGDATABASE,
    host: env.PGHOST,
  },
  schemaFilter: "wareboxes",
};
