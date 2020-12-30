# Health Journal - RESTful API server

This repository is for the
RESTFul API server. To learn more about the application, please visit the 
[client repository on GitHub](https://github.com/mashinke/health-journal-client).

## Technology
This project was developed with __Node.js__ + __Express.js__ + __Postgresql__ 
on the back end, and __React__ on the front end. The server is deployed on 
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
HTTP STATUS 200 OK
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
HTTP STATUS 200 OK
location: /api/user/1
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