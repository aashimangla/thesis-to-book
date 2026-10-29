# ThesisToBook backend

Express + MongoDB (Mongoose) + JWT.

## Run
    cp .env.example .env     # fill in MONGO_URI and JWT_SECRET
    npm install
    npm run dev

## Endpoints
| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | /api/contact | public | Submit enquiry (multipart, file field `thesis`) |
| GET | /api/contact | admin | List enquiries (?status=&search=&page=&limit=) |
| GET | /api/contact/:id | admin | One enquiry |
| GET | /api/contact/:id/file | admin | Download manuscript |
| PATCH | /api/contact/:id | admin | Update `status` / `adminNotes` |
| DELETE | /api/contact/:id | admin | Delete enquiry + file |
| POST | /api/consultations | public | Request a consultation |
| GET/PATCH/DELETE | /api/consultations[/:id] | admin | Manage consultations |
| POST | /api/auth/register | first user, then admin | Create admin |
| POST | /api/auth/login | public | Get JWT |
| GET | /api/auth/me | admin | Current user |

## Form field names (contact)
fullName, email, phone, country, institution, qualification, documentType, subject,
bookTitle, wordCount, manuscriptStatus, publishingGoal, services (repeat per checkbox),
package, budget, timeline, thesis (file), message, heardAbout, consent, website (hidden honeypot).
