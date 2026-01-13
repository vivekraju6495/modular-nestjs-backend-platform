#  Emailer Library

## 1. Overview
The `@app/emailer` library is a modular email campaign management system designed to handle the creation, storage, scheduling, and sending of email templates and campaigns.
It integrates seamlessly with the Contacts Library, Queue Manager, and Auth Library, making it ideal for marketing, transactional, or bulk email delivery systems.
The module provides:
•	Centralized email element & template management.
•	Campaign creation, scheduling, and tracking.
•	Support for Redis-based queue processing (optional).
•	Compatibility with external contact lists or direct email lists.
________________________________________

## 2. Core Modules
The library is divided into three main modules, each handling a different responsibility.

### 2.1. Email Elements
•	Handles creation and management of reusable email blocks (headers, footers, text, buttons, images, etc.).
•	Elements are grouped for better organization and reusability.
•	Supports drag-and-drop ordering for flexible template composition.
Features
•	Create, edit, list, view, and delete element groups.
•	Create, edit, and reorder individual template elements.
•	Store reusable block content and attributes (HTML, CSS, JSON metadata).
________________________________________
### 2.2. Email Templates
•	Used to design complete email layouts using the defined elements.
•	Each template can be in draft or published state.
•	Supports default templates (system-defined) and user-created templates.
Features
•	Create, update, and delete templates.
•	Version control (draft, published).
•	Visual template builder using predefined elements.
•	Store layout as JSON + generated HTML.
________________________________________
### 2.3. Campaigns
•	Manage email marketing campaigns that target contacts or custom email lists.
•	Campaigns can be sent immediately or scheduled.
•	Uses the Queue Manager (Redis) for scalable email dispatching.
•	Tracks delivery status (queued, sent, failed, cancelled).
Features
•	Create, view, and list campaigns.
•	Schedule campaigns for future send.
•	Link campaigns with templates and contact lists.
•	Optionally send emails directly using provided recipient emails (without storing them as contacts).
•	Automatic logging of send status in lib_emailer_email_send_jobs.


## 3. Integration Overview

Dependency	Purpose
-----------------------------
@app/contacts	Provides recipient contact lists for campaigns.
@app/queue-manager	Handles background email sending (Redis queue).
@app/email	Sends individual emails via SMTP.
@app/auth	Provides authentication and user context.
________________________________________

## 4. Environment Configuration
Variable	Description	Example
-----------------------------------

REDIS_URL	Redis connection URL (for queueing)	redis://localhost:6370

SMTP_HOST	SMTP server host (used by email sender)	smtp.gmail.com
SMTP_PORT	SMTP server port	587
SMTP_USER	SMTP user/email	noreply@example.com
SMTP_PASS	SMTP password	yourpassword
________________________________________

## 5. Database Design

### 5.1. Email Elements Group
Stores logical groupings of elements (like “Headers”, “Footers”, “User Blocks”).

Column	Type	Description
-----------------------------------------
uuid	uuid	Unique identifier
name	varchar(150)	Group name
description	text	Optional description
order	integer	Used for sorting
user_id	bigint	Created by user
company_id	bigint	Associated company
status	boolean	Active/inactive
created_at / updated_at	timestamp	Auditing fields
________________________________________
### 5.2. Email Elements
Stores reusable blocks such as headers, footers, text boxes, buttons, etc.

Column	Type	Description
------------------------------------------------
uuid	uuid	Unique ID
group_id	integer	Reference to group
name	varchar(150)	Element name
block	text	HTML block content
attributes	json	Style or configuration metadata
thumbnail	text	Thumbnail for UI preview
order	integer	Ordering within group
status	boolean	Active/inactive
________________________________________
### 5.3. Email Templates
Stores complete email template structures.

Column	Type	Description
------------------------------------------
uuid	uuid	Unique ID
name	varchar(255)	Template name
model	json	Layout data (builder structure)
html	text	Generated HTML output
layout	json	Design/layout structure
version	enum('draft', 'published')	Template version
type	enum('default', 'user')	System or user-created
thumbnail_url	text	Preview image
is_published	boolean	Publish status
________________________________________
### 5.4. Email Campaigns
Defines campaign metadata, linking templates and recipients.

Column	Type	Description
-------------------------------
uuid	uuid	Unique ID
name	varchar(255)	Campaign name
template_id	integer	Linked email template
from_name	varchar(255)	Display sender name
from_email	varchar(255)	Sender email
reply_to	varchar(255)	Reply email
subject	text	Email subject
status	enum('draft','scheduled','sending','sent','paused')	Campaign status
send_at	timestamptz	Schedule time
audience	jsonb	Recipients (contacts or direct emails)
________________________________________
### 5.5. Email Send Jobs
Tracks sending and delivery of each campaign email.

Column	Type	Description
-------------------------------
uuid	uuid	Unique ID
campaign_id	bigint	Reference to campaign
recipient_contact_id	uuid	Reference to contact (if exists)
email	varchar(255)	Recipient email
status	enum('queued','sent','failed','cancelled')	Send status
attempts	integer	Retry count
last_error	text	Error details if failed
sent_at	timestamptz	Timestamp of send
created_at / updated_at	timestamp	Audit fields
________________________________________
## 6. Campaign Sending Logic

1.	User Creates Campaign
o	Defines template, audience, subject, and sender info.
o	Optionally schedules the send.

2.	When Sending Begins
o	If @app/queue-manager and Redis are enabled → campaigns are queued.
o	Otherwise, emails are sent sequentially via the SMTP service.

3.	Job Tracking
o	Each recipient creates a record in lib_emailer_email_send_jobs.
o	Status updated based on delivery success/failure.

4.	Error Handling
o	Failed attempts increment retry count.
o	Retries are capped (default: 3 attempts).
o	Failed jobs are logged for later analysis.



## 7. Optional Queue Integration
If @app/queue-manager is installed:
•	Each email job is added to Redis queue.
•	Background workers pick jobs and send emails asynchronously.
•	Ensures scalability and reliability under high loads.
If queue manager is not installed:
•	The library falls back to direct SMTP sending.

## 8. Error Handling
•	Validation for missing fields (e.g., subject, audience).
•	Graceful fallback if Redis is unavailable.
•	Retry logic for failed email jobs.
•	Logged errors stored in last_error column.
________________________________________
## 9. Security & Compliance
•	Emails sanitized before sending.
•	Campaign senders must have verified email addresses.
•	GDPR-friendly opt-in model (uses contacts.permission field).
•	No hardcoded credentials — all SMTP/Redis keys from .env.
________________________________________
## 10. Maintenance
•	Periodic cleanup of old email send logs (deleted_at).
•	Monitoring Redis job queues for failed or stuck jobs.
•	Archiving old campaign data to reduce DB size.
________________________________________
## 11. Future Enhancements
•	🔹 Email open & click tracking.
•	🔹 A/B testing for campaigns.
•	🔹 Visual email builder UI integration.
•	🔹 Analytics dashboard for delivery metrics.
•	🔹 Template version history and rollback.
•	🔹 Support for external APIs like SendGrid, SES, or Mailgun.
 

