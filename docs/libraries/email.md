Email Library

## 1. Overview
`@app/email` is a reusable email service library for NestJS applications.
It provides a centralized and consistent way to send transactional and notification emails across multiple modules or microservices.
The library is designed to work independently or alongside other internal packages (such as @app/auth) and integrates with standard SMTP servers.
It focuses solely on email delivery, template management(register email, otp email etc), and configurable sender behavior, without handling authentication or queueing by itself.

## 2. Core Features

### 2.1 SMTP Email Delivery
•	Uses an SMTP provider for sending all outgoing emails.
•	Supports configurable SMTP host, port, and authentication credentials.
•	Works with any standard mail service (e.g., Gmail SMTP, Amazon SES, SendGrid SMTP, Zoho, etc.).

### 2.2 Dynamic Template Support
•	Emails can be sent using either:
o	Plain text or HTML content, or
o	Predefined templates stored in the database or file system.
•	Template placeholders can be dynamically replaced at runtime using context variables.

### 2.3 Configurable Sender Information
•	Default “from” address and display name are configurable through environment variables or system configuration.
•	Developers can override the sender info per email request if needed.

### 2.4 Reusable Across Modules
•	The library can be imported into any NestJS module that requires email functionality (e.g., @app/auth,@app/emailer).
•	Exposes a simple and uniform API to send emails from anywhere in the application.

## 3. Installation & Integration

### 3.1 Installation
npm install @app/email

### 3.2 Module Registration
The EmailModule can be imported into any NestJS module or globally in the root module for shared usage.
Example:
•	Register it globally to make the email service accessible in all modules.
•	Or import locally if needed for a specific feature only.

In the main app
app.module.ts file
// Optional EmailModule import
let EmailModule: any;
try {
  ({ EmailModule } = require('libs/email/src'));
} catch (e) {
  EmailModule = null;
}
@Module({
imports: [
    ...(EmailModule ? [EmailModule]: []),
  ],
})
Other required library needs to manually added the email library
let EmailService: any;
try {
  ({ EmailService } = require('libs/email/src'));
} catch (e) {
  EmailService = null;
}

Inside the export class
             private emailService?: any;
Inside the constructor
   constructor(
             private readonly moduleRef: ModuleRef, 
   ) {}

async onModuleInit() {
        if (EmailService) {
            try {
                this.emailService = this.moduleRef.get(EmailService, { strict: false });
            } catch {
                console.log('Email Service not found in DI container');
                this.emailService = null;
            }
        } else {
            console.log('Email library not installed, skipping');
        }
    }

### 3.3 Environment Requirements
Before using `@app/email`, ensure the following configurations are set in your environment or system configuration table:
Variable	Description	Example
SMTP_HOST	SMTP server hostname	smtp.gmail.com
SMTP_PORT	SMTP server port	587
SMTP_SECURE	Whether to use TLS/SSL	false
SMTP_USER	SMTP username	noreply@yourapp.com
SMTP_PASS	SMTP password or app key	app-password
EMAIL_FROM	Default “from” address	noreply@yourapp.com
EMAIL_FROM_NAME	Display name for sender	MyApp Support
EMAIL_LOGGING	Enable/disable email logs in DB	true
These variables can also be loaded from a shared system_configuration table to allow runtime adjustments without redeployment.

## 5. Configuration

### 5.1 Default Behavior
•	By default, the library reads SMTP and sender information from environment variables.
•	Emails are sent asynchronously using the underlying transporter (e.g., Nodemailer).

### 5.2 Retry & Error Handling
•	Each email send attempt is wrapped in try/catch with clear error logging.
•	If SMTP temporarily fails, it returns an error response so that higher-level modules can implement retries or queueing.

## 6. Email Sending Flow

### 6.1 Overview
1.	Application calls the email service with required parameters (to, subject, template, context, etc.).
2.	The service builds the email content using either raw HTML or a registered template.
3.	SMTP credentials and sender info are resolved from configuration.
4.	Email is sent via SMTP.
7. Supported Email Types
The library can be used for:
•	Transactional emails (e.g., registration, OTP verification, password reset)
•	System notifications (e.g., status updates, reports)
•	Marketing or bulk emails (only if external queueing is added)
Currently, it sends one email at a time; queue integration (e.g., BullMQ) can be added externally if required for bulk delivery.

## 8. Extensibility
The @app/email library is designed to be modular and extendable:
•	Custom Transporters: Developers can inject alternate transporters (e.g., AWS SES SDK, SendGrid API).
•	Template Engines: Support for file-based templates (Handlebars, EJS, etc.) can be added.
•	Queue Integration: Can easily integrate with BullMQ or RabbitMQ for background email sending.
•	Multi-provider Support: Future enhancement may include fallback SMTP providers.
________________________________________
## 9. Security & Compliance
•	SMTP credentials should never be hardcoded — always stored securely in environment or secret manager.
•	Ensure TLS/SSL is enabled for SMTP (SMTP_SECURE=true) in production.
•	Avoid sending sensitive data (like passwords or tokens) directly in email content.
•	Comply with anti-spam laws (include identifiable sender info, unsubscribe options where applicable).
________________________________________
## 10. Summary
`@app/email` provides a consistent and configurable way to send emails across all internal services.
It helps unify how emails are sent, logged, and managed without repeating SMTP logic in multiple places.
Key advantages:
•	Centralized configuration
•	SMTP-based delivery
•	Template and dynamic context support
•	Easy integration with other libraries like @app/auth




