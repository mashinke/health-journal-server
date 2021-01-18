# Health Journal - RESTful API server

This repository is for the
RESTFul API server. To learn more about the application, please visit the 
[client repository on GitHub](https://github.com/mashinke/health-journal-client).

## Technology
This project was developed with [__Node.js__](https://nodejs.org/) + [__Express.js__](http://expressjs.com/) + [__Knex.js__](https://knexjs.org/) + [__Postgresql__](https://www.postgresql.org/) 
on the back end, and [__React__](https://reactjs.org/) + [__styled-components__](https://styled-components.com/) on the front end. The server is deployed on 
[Heroku](https://www.heroku.com/), and the client on [Vercel](https://vercel.com/).

## API Documentation

### POST /api/auth

#### Authenticates login and provides JSON Web Token.
_Requires a request body._

| key      |              Value |
| :------- | -----------------: |
| email    | string, _required_ |
| password | string, _required_ |

#### Example response:

```
HTTP STATUS 200 OK
{
  "token": 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZXhwaXJlc0luIjoiN2QiLCJpYX
    QiOjE2MDUyMjA3MzUsInN1YiI6InRlc3RAZXhhbXBsZS5uZXQifQ.OAzmBM8JUOx3dxnyl1ledSp
    5sSIekTvsUJeC5hhSJus"
}
```

### POST /api/user

#### Creates a new user
_Requires a request body._

| key      |              Value |
| :------- | -----------------: |
| email    | string, _required_ |
| password | string, _required_ |
| username | string, _required_ |

#### Example response:

```
HTTP STATUS 201 CREATED
location: /api/user/1
{
  "id": 1,
  "username": "demo",
  "email": "demo@example.com",
}
```

### POST /api/record

#### Creates a new record

_Requires a request body._

| key    |                   Value |
| :----- | ----------------------: |
| formId |     integer, _required_ |
| body   | JSON object, _required_ |

#### Example response:

```
HTTP STATUS 201 CREATED
location: /api/record/1
{
    "id": 3,
    "name": "Example Form",
    "description": "An example form",
    "values": {
        "values": {
            "Range Field": 4,
            "Number Field": 18,
            "String Field": "I posted a record!",
            "Yes or No Field": true
        }
    },
    "fields": [
        {
            "type": "string",
            "label": "String Field"
        },
        {
            "type": "number",
            "label": "Number Field"
        },
        {
            "type": "range",
            "label": "Range Field",
            "min": 0,
            "max": 5
        },
        {
            "type": "boolean",
            "label": "Yes or No Field"
        }
    ],
    "created": "2020-12-30T19:45:48.531Z",
    "formId": 1
}
```

### GET /api/record

#### Get user records

#### Example response:

```
HTTP STATUS 200 OK
[
    {
        "id": 1,
        "name": "Example Form",
        "description": "An example form",
        "values": {
            "Range Field": 3,
            "Number Field": 6,
            "String Field": "An example string entry",
            "Yes or No Field": true
        },
        "fields": [
            {
                "type": "string",
                "label": "String Field"
            },
            {
                "type": "number",
                "label": "Number Field"
            },
            {
                "type": "range",
                "label": "Range Field",
                "min": 0,
                "max": 5
            },
            {
                "type": "boolean",
                "label": "Yes or No Field"
            }
        ],
        "created": "2020-12-30T19:08:27.012Z",
        "formId": 1
    },
    {
        "id": 2,
        "name": "Example Form",
        "description": "An example form",
        "values": {
            "Range Field": 5,
            "Number Field": 11,
            "String Field": "Another example string entry",
            "Yes or No Field": false
        },
        "fields": [
            {
                "type": "string",
                "label": "String Field"
            },
            {
                "type": "number",
                "label": "Number Field"
            },
            {
                "type": "range",
                "label": "Range Field",
                "min": 0,
                "max": 5
            },
            {
                "type": "boolean",
                "label": "Yes or No Field"
            }
        ],
        "created": "2020-12-30T19:08:27.012Z",
        "formId": 1
    }
]
```

### DELETE /api/record/:record_id

#### Delete a record

#### Example response:

```
HTTP STATUS 204 NO CONTENT
```


### GET /api/form/
#### Get user forms

#### Example response:

```
HTTP STATUS 200 OK
[
    {
        "id": 2,
        "name": "Another Form",
        "description": "Some Description",
        "fields": [
            {
                "id": "6484c370-d80d-4f3d-ae6d-bd87286617bd",
                "type": "string",
                "label": "Let's make this make sens"
            },
            {
                "id": "4fbda42c-6816-4b00-8122-b6c61af63c2f",
                "type": "string",
                "label": "Absolutely wondful idea"
            },
            {
                "id": "838d76aa-8dea-4a72-a310-5fbc5dd90c28",
                "type": "time",
                "label": "New Time Field"
            },
            {
                "id": "5bc36d68-98df-4cf1-a3b1-70deb0d5c950",
                "type": "number",
                "label": "New Number Field"
            }
        ]
    },
    {
        "id": 3,
        "name": "Yet Another Form",
        "description": "Description",
        "fields": [
            {
                "id": "de780dab-2b6b-4305-8a5e-96d95666a46d",
                "type": "number",
                "label": "New Number Field"
            },
            {
                "id": "39d2dc4d-3233-4ba5-9fdb-71bfe2a61442",
                "type": "time",
                "label": "New Time Field"
            },
            {
                "id": "e10c98b2-21f5-46c4-83fe-18aad33d048f",
                "type": "string",
                "label": "New Text Field"
            }
        ]
    }
]
```


### POST /api/form

#### Creates a new form

_Requires a request body._

| key  |                   Value |
| :--- | ----------------------: |
| body | JSON object, _required_ |

#### Example response:

```
HTTP STATUS 201 CREATED
location: /api/form/1
{
    "id": 9,
    "name": "new-test-form",
    "description": "another form to test",
    "fields": [
        {
            "id": "2888e8b2-4ec2-11eb-b543-bfee7e1d4520",
            "type": "string",
            "label": "labelOne"
        },
        {
            "id": "2888aa74-4eef-11eb-b544-9ff93ffc6d13",
            "type": "number",
            "label": "labelTwo"
        }
    ]
}
```


### PATCH /api/form/form_id

#### Updates a user form

_Requires a request body._

| key  |                   Value |
| :--- | ----------------------: |
| body | JSON object, _required_ |

#### Example response:

```
HTTP STATUS 200 OK
{
    "id": 2,
    "name": "second updated form name",
    "description": "Some Description",
    "fields": [
        {
            "id": "2888a8b2-4ec2-11eb-b543-bfee7e1d4520",
            "type": "string",
            "label": "Renamed String Field"
        },
        {
            "id": "adad44ew-4ec2-11eb-b543-bfee7e1d4520",
            "type": "string",
            "label": "Another String Field"
        }
    ]
}
```