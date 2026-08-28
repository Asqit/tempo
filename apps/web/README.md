# Tick - Frontend

Tick is a modern open-source time-tracking utility with simple client / project tracking capability.

## Tech Stack

- Framework: React 19 (compiler)
- Language: Typescript 6
- Styling: Tailwind CSS / Shadcn
- Routing: Tanstack Router
- Data: openapi-ts + react-query

> backend is FastAPI with Postgres and Python 3.14

## Getting Started

```shell
$ git clone ".." # clone the repository
$ cd frontend # cd-in
$ bun install # install dependencies
$ cat .env.example > .env # copy default variables
$ $EDITOR .env # edit the variables
$ bun dev # concurrently executes openapi-typescript and vite
```

## Structure

```shell
@
├── assets
├── components       - global components
├── features         - features slices
├── index.css        - root css config
├── layouts          - app layout-ing
│   ├── app
│   └── public
├── lib              - helpers
├── main.tsx         - entrypoint of the application
├── routeTree.gen.ts - automatically created, DO NOT MODIFY
└── routes           - SPA routing
    ├── __root.tsx
    ├── _public      - Wide web
    └── app          - Authorized
```
