# Queue Management

## 1. Overview
The `@app/queue-manager` library provides a centralized queue management system for handling background tasks — primarily designed for sending multiple emails asynchronously and reliably.
It leverages Redis as the underlying message broker and integrates easily with other NestJS modules via the Bull queue library.
This module is designed to be plug-and-play — meaning it can be installed in any microservice or application that has Redis configured.
________________________________________
## 2. Core Features
•	Email queue management — handle bulk or scheduled email dispatch.
•	Redis-based message queue using Bull.
•	Automatic retry mechanism for failed jobs.
•	Configurable concurrency and job processing logic.
•	Graceful fallback if Redis is unavailable (no app crash).
•	Reusable module that can be integrated into any app requiring background task processing.
________________________________________
## 3. Environment Variables
Variable	Description	Example
REDIS_URL	Redis connection URL used for               queue communication	redis://localhost:6370

## 4. Installation & Setup

### Step 1: Add Redis configuration to .env
REDIS_URL=redis://localhost:6370

## 5. Module Architecture
### 5.1. QueueManagerModule
•	Provides a centralized Bull configuration for Redis.
•	Registers different queues dynamically (e.g., emailQueue).
•	Exports configured queues for other modules to use.
### 5.2. QueueService
•	Exposes APIs to add, process, and manage jobs.
•	Handles email job creation, scheduling, and retries.
•	Provides monitoring hooks for queue health and failure counts.

### 5.4. Redis Configuration
•	Defined in a central config file (e.g., queue.config.ts).
•	Reads Redis connection string from REDIS_URL.

export const queueConfig: BullModuleOptions = {
redis: {
url: process.env.REDIS_URL,
},
};


## 6. Job Flow

### 1.	Email Enqueue —
A new email job is created using QueueService.enqueueEmail().
### 2.	Redis Queue Push —
Job details are pushed into the Redis queue.
### 3.	Worker Pickup —
EmailProcessor consumes the job asynchronously.
### 4.	Email Dispatch —
`@app/email` library sends the actual email.
### 5.	Job Completion / Retry —
o	If successful → marked as completed.
o	If failed → retried up to 3 times with exponential backoff.
________________________________________
## 7. Error Handling & Logging
•	If Redis is unreachable, the module logs a warning and disables queue functionality without breaking the app.
•	Failed jobs are automatically retried; permanent failures are logged for later inspection.
•	Integrated with @app/logger for consistent error tracking.

## 10. Maintenance & Cleanup
•	Redis queues are auto-cleaned after job completion to prevent memory buildup.(Not implemented)
•	Periodic Redis cleanup scripts can be scheduled for stale jobs. .(Not implemented)
________________________________________
## 11. Future Enhancements
•	Add queue dashboard (BullBoard or Arena) for monitoring job status.
•	Introduce priority queues for time-sensitive emails.
•	Support delayed jobs (e.g., scheduled email delivery).
•	Integrate distributed queue handling for microservice scaling.

