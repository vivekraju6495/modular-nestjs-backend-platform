# Modular NestJS Backend Platform

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

A **production-ready, modular backend platform** built with **NestJS, TypeScript, and PostgreSQL**.
Designed as a reusable foundation for building **scalable REST APIs** without rewriting common backend infrastructure.

---

## 🚀 Why This Platform Exists

Starting a new backend project often means rebuilding the same things:

* Authentication & authorization
* Database setup
* Email handling
* Queues & background jobs
* Logging & uploads

This platform provides those **out of the box**, so teams can focus on **business logic**, not boilerplate.

---

## 🏗️ Architecture Overview

This platform follows a **library-first modular architecture**. Each domain library is **fully self-contained** and owns its own:

* Controllers (REST APIs)
* Services (business logic)
* Modules
* Migrations
* DTOs & validations

There is **no monolithic API layer**.

```
┌────────────┐
│  Client    │  (Web / Mobile / External)
└─────┬──────┘
      │ REST API Calls
      ▼
┌───────────────────────────────────────────────────────────┐
│                    NestJS Application                     │
│                                                           │
│  ┌───────────────┐   ┌────────────────┐   ┌─────────────┐ │
│  │ auth lib      │   │ contacts lib   │   │ email lib   │ │
│  │ ─ Controller  │   │ ─ Controller   │   │ ─ Controller│ │
│  │ ─ Service     │   │ ─ Service      │   │ ─ Service   │ │
│  │ ─ Module      │   │ ─ Module       │   │ ─ Module    │ │
│  └───────┬───────┘   └───────┬────────┘   └───────┬─────┘ │
│          │                   │                    │       │
│  ┌───────▼────────┐   ┌──────▼────────┐    ┌──────▼─────┐ │
│  │ auth-roles lib │   │ company-profile│   │ emailer lib│ │
│  │ (RBAC)         │   │ domain logic   │   │ templates  │ │
│  └────────────────┘   └────────────────┘   └────────────┘ │
│                                                           │
│  Shared Infrastructure Libraries                          │
│  ─ logger      ─ queue-manager      ─ uploader            │
│                                                           │
└───────────────┬───────────────────────────────────────────┘
                │
        ┌───────▼────────┐
        │ PostgreSQL DB  │
        └────────────────┘
```

---

## 📦 Libraries Overview

### Domain Libraries

* **auth** – Authentication & JWT handling
* **auth-roles** – Role-based access control (RBAC)
* **company-profile** – Organization & profile management
* **contacts** – Contact & entity management

### Communication

* **email** – Email delivery service (SMTP / provider abstraction)
* **emailer** – Email templates, campaigns, and composition

### Shared Infrastructure

* **logger** – Centralized logging
* **queue-manager** – Background jobs & async processing (Redis)
* **uploader** – Cloud file uploads (AWS S3-ready)

---

## 🐳 Docker Support

This project can run fully in Docker with three containers:

- **NestJS application** – your modular backend
- **PostgreSQL** – database
- **Redis** – queue and cache

### Run the Project

```bash
docker-compose up --build

---
---
### Access the Services

* API: `http://localhost:3000`
* Swagger docs: `http://localhost:3000/api/docs` *(to be added later)*

## ⚠️ Before You Start

Before running the project, make sure to:

1. Copy `.env.example` to `.env` and configure your environment variables.
2. If using Docker, ensure service names are correct in `.env`:

   ```bash
   DB_HOST=postgres
   REDIS_URL=redis://redis:6379

3. Run the database migrations to create all necessary tables:
    # Using NestJS/TypeORM
    npm run migration:run

    # Or using TypeORM CLI
    npx typeorm migration:run

4. After migrations are successful, start the application:

    ```bash
    docker-compose up --build

---

## 📬 Postman Collection

You can use the Postman collection to test all APIs of this modular backend platform:

- Download the collection
- Import it into Postman
- Make sure your `.env` is configured correctly
- Run the APIs directly

> 🔹 Note: Each library has its own endpoints and also included health check APIs (auth, auth-roles, contacts, email, emailer, company-profile)

---

## 📄 Documents

Libraries Document are mentioned in the folder path `docs/libraries`

---
## 📄 Environment Variables

Add a `.env` file in the root of your project. You can copy from `.env.example`:

```bash
cp .env.example .env
```

**Example `.env.example`:**
---

## 🧩 Open Source Collaboration

### GitHub Issues

Use **Issues** for:

* Bug reports
* Feature requests
* Documentation improvements

### GitHub Discussions

Use **Discussions** for:

* Architecture questions
* Setup help
* Best practices

---

## 🤝 Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## ⭐ If You Find This Useful

Please consider **starring ⭐ the repository** to support the project and help others discover it.
