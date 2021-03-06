BEGIN;

CREATE TABLE "form" (
  "id" SERIAL PRIMARY KEY,
  "id_user" INTEGER REFERENCES "user"(id) NOT NULL
);

CREATE TABLE "form_version" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "fields" JSONB NOT NULL,
  "latest" BOOL DEFAULT true,
  "id_form" INTEGER REFERENCES "form"(id) NOT NULL
);

CREATE TABLE "record" (
  "id" SERIAL PRIMARY KEY,
  "created" TIMESTAMP DEFAULT NOW(),
  "values" JSONB NOT NULL,
  "id_form_version" INTEGER REFERENCES "form_version"(id) NOT NULL
);

CREATE TABLE "tag" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT
);

CREATE TABLE "record_tag" (
  "id" SERIAL PRIMARY KEY,
  "id_tag" INTEGER REFERENCES "tag"(id),
  "id_record" INTEGER REFERENCES "record"(id)
);

COMMIT;