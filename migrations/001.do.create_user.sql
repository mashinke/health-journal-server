CREATE TABLE "user" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE
);
