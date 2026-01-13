
# Company-Profile Library (@app/company-profile)

## 1. Overview
`@app/company-profile` manages company registration and profile management.  
Supports authenticated or optionally authenticated users to create, view, update, list, and delete company profiles.

## 2. Database Table

### Table: lib_companies
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL (PK) | Auto-increment primary key |
| uuid | UUID | Unique company identifier (`uuid_generate_v4()`) |
| user_id | BIGINT | References user who created the company (nullable for optional JWT) |
| company_Name | VARCHAR(255) | Name of the company |
| about | TEXT | Description/about the company |
| registrationNumber | VARCHAR | Unique company registration number |
| industry | VARCHAR(255) | Industry/sector |
| address1 | VARCHAR(255) | Primary address line |
| address2 | VARCHAR(255) | Secondary address line (optional) |
| city | VARCHAR(100) | City |
| state | VARCHAR(100) | State/Province |
| zipCode | VARCHAR(20) | ZIP/Postal code |
| country | VARCHAR(100) | Country |
| email | VARCHAR(100) | Company email |
| phone | VARCHAR(20) | Company contact number |
| companyLogo | VARCHAR(255) | URL or file path for logo |
| status | BOOLEAN | Active status (default true) |
| created_by | BIGINT | User ID who created the record |
| createdAt | TIMESTAMP | Record creation timestamp |
| updated_by | BIGINT | User ID who last updated |
| updatedAt | TIMESTAMP | Record update timestamp |
| deletedAt | TIMESTAMP | Soft deletion timestamp (nullable) |

Constraints:
- `UQ_535ddf773996ede3697d07ef710` — Unique UUID  
- `UQ_7bf9bf7b09ca1dca07a942b5691` — Unique registrationNumber  
- `PK_d4bc3e82a314fa9e29f652c2c22` — Primary Key on id

## 3. Controller

### Path: /company
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /company | ❌ | Health check — returns welcome message |
| POST | /company/create | ✅ (Optional) | Registers a new company |
| GET | /company/list | ✅ (Optional) | Paginated list of all companies |
| GET | /company/view/:uuid | ✅ (Optional) | Detailed info by UUID |
| PATCH | /company/update/:uuid | ✅ (Optional) | Updates company details by UUID |
| DELETE | /company/delete/:uuid | ✅ (Optional) | Soft deletes company record by UUID |

## 4. Guards
`OptionalJwtAuthGuard` allows authenticated and unauthenticated access.  
If a token is present, extracts `userId`; otherwise `userId = null`.

## 5. Service Responsibilities
`CompanyProfileService` handles:
- Creating a company and associating with userId  
- Fetching company lists with pagination and filters  
- Viewing company details by UUID  
- Updating company details  
- Soft deletion (updating `deletedAt` timestamp)  

## 6. Installation & Setup
Install via monorepo (Nx or custom workspace):
```bash
npm install @app/company-profile
```
