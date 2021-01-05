BEGIN;

TRUNCATE
  "user", "form_version", "form", "record_tag", "record", "tag";

INSERT INTO "user" ("id", "email", "username", "password")
VALUES
  (
    1,
    'demouser@example.com',
    'demouser',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
  );

INSERT INTO "form" ("id", "id_user")
VALUES (1, 1);

INSERT INTO "form_version" ("id", "name", "fields", "description", "id_form")
VALUES 
  (
    1,
    'Example Form',
    '[
      {
        "id": "2888a8b2-4ec2-11eb-b543-bfee7e1d4520",
        "label": "String Field",
        "type": "string"
      },
      {
        "id": "2888aa74-4ec2-11eb-b544-9ff93ffc6d13",
        "label": "Number Field",
        "type": "number"
      },
      {
        "id": "2888aab0-4ec2-11eb-b545-8f760ba05e58",
        "label": "Range Field",
        "type": "range",
        "min": 1,
        "max": 5
      },
      {
        "id": "2888aad8-4ec2-11eb-b546-9f3c6f78d71a",
        "label": "Yes or No Field",
        "type": "boolean"
      }
    ]',
    'An example form',
    1
  ),
  (
    2,
    'Example Form (Updated)',
    '[
      {
        "id": "2888ab0a-4ec2-11eb-b547-c3bbef39ea72",
        "label": "Number Field",
        "type": "number"
      },
      {
        "id": "2888ab32-4ec2-11eb-b548-1f0a079c78f2",
        "label": "Number Field 2",
        "type": "number"
      },
      {
        "id": "2888ab64-4ec2-11eb-b549-f353c560eeb5",
        "label": "Range Field",
        "type": "range",
        "min": 1,
        "max": 10
      },
      {
        "id": "2888ab8c-4ec2-11eb-b54a-5fe1e681227d",
        "label": "Yes or No Field",
        "type": "boolean"
      }
    ]',
    'Example form update',
    1
  );

INSERT INTO "record" ("id", "values", "id_form_version")
VALUES 
  (
    1,
    '{
      "2888a8b2-4ec2-11eb-b543-bfee7e1d4520": "An example string entry",
      "2888aa74-4ec2-11eb-b544-9ff93ffc6d13": 6,
      "2888aab0-4ec2-11eb-b545-8f760ba05e58": 3,
      "2888aad8-4ec2-11eb-b546-9f3c6f78d71a": true
    }',
    1
  ),
  (
    2,
    '{
      "2888a8b2-4ec2-11eb-b543-bfee7e1d4520": "Another example string entry",
      "2888aa74-4ec2-11eb-b544-9ff93ffc6d13": 11,
      "2888aab0-4ec2-11eb-b545-8f760ba05e58": 5,
      "2888aad8-4ec2-11eb-b546-9f3c6f78d71a": false
    }',
    1
  );

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));
SELECT setval('form_id_seq', (SELECT MAX(id) from "form"));
SELECT setval('form_version_id_seq', (SELECT MAX(id) from "form_version"));
SELECT setval('record_id_seq', (SELECT MAX(id) from "record"));

COMMIT;
