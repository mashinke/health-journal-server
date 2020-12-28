# Health Journal - RESTful API server

This repository is for the
RESTFul API server. To learn more about the application, please visit the 
[client repository on GitHub](https://github.com/mashinke/health-journal-client).

## Technology
This project was developed with __Node.js__ + __Express.js__ + __Postgresql__ 
on the back end, and __React__ on the front end. The server is deployed on 
[Heroku](https://www.heroku.com/), and the client on [Vercel](https://vercel.com/).

## Data Schema

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