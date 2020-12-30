BEGIN;

TRUNCATE
  "user", "form", "record_tag", "record", "tag";

INSERT INTO "user" ("id", "email", "username", "password")
VALUES
  (
    1,
    'demouser@example.com',
    'demouser',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
  );

INSERT INTO "form" ("id", "name", "fields", "description", "id_user")
VALUES 
  (
    1,
    'Example Form',
    '[
      {
        "label": "String Field",
        "type": "string"
      },
      {
        "label": "Number Field",
        "type": "number"
      },
      {
        "label": "Range Field",
        "type": "range",
        "min": 1,
        "max": 5
      },
      {
        "label": "Yes or No Field",
        "type": "boolean"
      }
    ]',
    'An example form',
    1
  );

INSERT INTO "record" ("id", "values", "id_form")
VALUES 
  (
    1,
    '{
      "String Field": "An example string entry",
      "Number Field": 6,
      "Range Field": 3,
      "Yes or No Field": true
    }',
    1
  ),
  (
    2,
    '{
      "String Field": "Another example string entry",
      "Number Field": 11,
      "Range Field": 5,
      "Yes or No Field": false
    }',
    1
  );

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));
SELECT setval('form_id_seq', (SELECT MAX(id) from "form"));
SELECT setval('record_id_seq', (SELECT MAX(id) from "record"));

COMMIT;
