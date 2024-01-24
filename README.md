# T-Chat

T-Chat is a chat application with authentication, authorization, real-time messaging and a host of other functionalities.

## Built With

- M.E.R.N stack
- TailwindCSS
- Typescript
- Redux Toolkit / RTKQuery
- Redis Cache
- Socket.io
- Framer-Motion
- Cloudinary

## Live Site

[Live Site URL](https://tobychat.netlify.app/)

## Installation

To work with or inspect the code base

- Clone the repo

```bash
git clone git@github.com:Toby2507/T-Chat.git
```

- Install dependencies

```bash
npm install
```

## Challenges and Solutions

- **Slow query response time for chat instances with long history** : To mitigate this I introduced Redis-Cache for all message related queries to reduce server latency. This drop the query response time from over 2000ms to below 50ms

- **Authentication** : Authentication and authorization were implemented following the OAuth2 method i.e. using access and refresh token for all data transfer between the server and client.

- **Server Security** : _CORS_ was used for secure cross-origin requests and data transfer between the client and the server. _Compression_ was used to reduce payload size and increase the performance of the app. _Helmet_ was used to secure HTTP headers returned by the app. _Bcrypt_ was used to encrypt users passwords.

- **Unwanted documents clogging the database** : MongoDB TTL index was used to set a delete timeout on documents that haven't met a certain condition after a certain amount of time e.g. User account is deleted after 1 hour if the user email is not verified.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.
