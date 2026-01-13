#  Contacts Library

## 1. Overview
The `@app/contacts` library manages contact information used for communication and marketing operations (e.g., bulk email campaigns).
It supports creating, updating, deleting, listing, and bulk uploading contacts, along with country and phone code management.
This library integrates directly with the email module for marketing and bulk email operations.
________________________________________
## 2. Dependencies
•	Database (PostgreSQL with UUID & enums)
•	@nestjs/common, @nestjs/core, @nestjs/platform-express
•	multer for file uploads
•	xlsx / csv-parser (used for parsing uploaded files)
•	Optional dependency: @app/email (for email sending operations)
________________________________________

## 3. Installation & Setup
## 4. Database Schema

### 4.1 Table: lib_contacts

Column	Type	Description
------------------------------
id	SERIAL (PK)	Primary key
uuid	UUID	Unique identifier
email	VARCHAR(255)	Contact email
first_name	VARCHAR(150)	First name
last_name	VARCHAR(150)	Last name
address / address1 / address2	VARCHAR(255)	Address details
city	VARCHAR(100)	City
state	VARCHAR(100)	State
zipcode	VARCHAR(20)	Zip code
country	VARCHAR(100)	Country name
number	VARCHAR(20)	Phone number
birthday	DATE	Date of birth
company_name	VARCHAR(255)	Associated company name
tags	TEXT[]	Contact tags (e.g., "client", "lead")
permission	ENUM (opted-in, opted-out)	Email marketing permission
is_subscribed	BOOLEAN	Subscription flag
status	BOOLEAN	Active/inactive status
created_at	TIMESTAMP	Created timestamp
updated_at	TIMESTAMP	Updated timestamp
deleted_at	TIMESTAMPTZ	Soft delete timestamp
country_id	BIGINT	Foreign key to lib_contacts_countries
________________________________________
### 4.2 Table: lib_contacts_countries

Column	Type	Description
----------------------------
id	SERIAL (PK)	Primary key
name	VARCHAR(100)	Country name
code	VARCHAR(10)	ISO country code
phone_code	VARCHAR(10)	Country phone code
isActive	BOOLEAN	Active status
createdAt	TIMESTAMP	Created timestamp
updatedAt	TIMESTAMP	Updated timestamp
Seeder automatically populates this table with global country data.
________________________________________
## 5. API Endpoints
Base Path: /contacts
Method	Endpoint	Description
GET	/	Health check
POST	/create	Create a new contact
GET	/list	List all contacts (with filters and pagination)
GET	/view/:uuid	View a contact by UUID
PATCH	/update/:uuid	Update contact details
DELETE	/delete/:uuid	Soft delete a contact
POST	/bulk-upload	Bulk upload contacts from CSV or XLSX
GET	/country	Fetch list of countries with codes

Bulk Upload Contacts
POST /contacts/bulk-upload
Form Data:
file: contacts.xlsx
Supported Formats:
•	.xlsx
•	.csv

### Sample XLSX Columns
| email | firstName | lastName | number | companyName | address | address1 | address2 | city | state | zipcode | country | birthday | permission |
|--------|------------|-----------|--------|---------------|----------|-----------|-----------|------|--------|----------|----------|------------|
| john.doe@yopmail.com | John | Doe | 1234567890 | ABC Corp | 123 Main St | Suite 1 | Floor 2 | New York | NY | 10001 | USA | 1990-01-01 | opted-in |

### Sample CSV Row
email,firstName,lastName,number,companyName,address,address1,address2,city,state,zipcode,country,birthday,permission
john.sam@yopmail.com,John,Sam,1234567890,ABC Corp,123 Main St,Suite 1,Floor 2,New York,NY,10001,USA,01-01-1990,opted-in
________________________________________

## 6. Bulk Upload Validation Rules
•	Duplicate emails are ignored.
•	Invalid email formats are skipped.
•	Empty rows are ignored.
•	permission field must be opted-in or opted-out.
________________________________________

## 7. Error Handling
•	Returns standardized JSON responses with statusCode, status, message, and data.
•	CSV/XLSX validation errors return row-level error messages.
________________________________________

## 8. Future Enhancements
•	Add phone & WhatsApp verification integration.
•	Support segmented contact groups.
•	Integration with @app/email for campaign-based sending.
________________________________________
