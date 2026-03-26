# backend-repo

Standalone Node.js + Express + MongoDB backend project with independent DevOps tooling.

## Features
- REST API with CRUD for items
- Endpoints:
  - `GET /items`
  - `POST /items`
  - `PUT /items/:id`
  - `DELETE /items/:id`
- Validation and centralized error handling
- CORS enabled for frontend integration

## Environment
Create `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/backend_repo_db
```

## Run locally
```bash
npm install
npm run dev
```

API runs on `http://localhost:5000`.

## Test and build
```bash
npm test
npm run build
```

**Jenkins / CI:** keep **`package-lock.json` committed** in Git so `npm ci` works. If it is missing from the remote repo, the Jenkinsfile falls back to `npm install`.

## Docker
The backend container needs a MongoDB container. Do not use `127.0.0.1` for
Mongo URI inside Docker because `localhost` points to the backend container itself.

Build image:

```bash
docker build -t backend-repo:latest .
```

Create network and run MongoDB:

```bash
docker network create backend-net
docker run -d --name backend-mongo --network backend-net -p 27017:27017 -e MONGO_INITDB_DATABASE=backend_repo_db mongo:7
```

Run backend container:

```bash
docker run -d --name backend-repo-container --network backend-net -p 5000:5000 -e PORT=5000 -e MONGODB_URI=mongodb://backend-mongo:27017/backend_repo_db backend-repo:latest
```

### Docker Compose (recommended)
From the `backend-repo` folder (only one `cd`):

```bash
cd backend-repo
docker compose up -d --build
```

Stop everything:

```bash
docker compose down
```

**If you see `container name "/backend-mongo" is already in use`:** you already started Mongo manually with that name. Remove the old containers, then compose again:

```bash
docker rm -f backend-mongo backend-repo-container
docker compose up -d --build
```

**PowerShell:** if your prompt is already `...\backend-repo>`, do **not** run `cd backend-repo` again (that path does not exist).

## CI (GitHub Actions)
Workflow: `.github/workflows/ci.yml`
- Triggers on push
- Installs dependencies
- Runs tests
- Runs build step

## CD (Jenkins)
Pipeline: `Jenkinsfile`
- Checkout
- Install dependencies
- Run tests
- Build Docker image
- Run container
- Send Slack notification via webhook credential `backend-slack-webhook`

## SonarQube
Config file: `sonar-project.properties`

Example analysis command:
```bash
sonar-scanner \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_SONAR_TOKEN
```
