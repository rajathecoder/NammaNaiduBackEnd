# Namma Naidu Backend

Backend API for the Namma Naidu application built with Node.js and Express.

## Features

- RESTful API architecture
- JWT authentication
- PostgreSQL database integration with Sequelize ORM
- Input validation
- Error handling middleware
- Security middleware (Helmet, CORS)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd NammaNaiduBackend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
- Set your PostgreSQL database credentials (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT)
- Set your JWT secret key
- Configure other environment variables as needed

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for auto-reloading.

### Production Mode
```bash
npm start
```

The server will run on `http://localhost:5000` by default (or the PORT specified in your `.env` file).

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Start registration flow, validate mobile, send OTP
- `POST /api/auth/verify-otp` - Validate OTP and create user with basic details
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get current user profile (requires authentication)
- `PUT /api/users/profile` - Update user profile (requires authentication)
- `POST /api/users/basic-details` - Create or update extended basic details captured from the onboarding wizard
- `GET /api/users` - Get all users (requires authentication)

## Project Structure

```
NammaNaiduBackend/
├── src/
│   ├── app.js                # Express app configuration
│   ├── server.js             # Application bootstrap
│   ├── config/               # Database + JWT configuration
│   ├── loaders/              # Future startup helpers
│   ├── middleware/           # Auth, validation, error handlers
│   ├── models/               # Sequelize models
│   ├── modules/
│   │   ├── auth/             # Auth controllers + routes
│   │   └── users/            # User controllers + routes
│   ├── services/             # Shared services (email, etc.)
│   └── utils/                # Logger, response helpers, constants
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variables template
└── README.md
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DB_NAME` - PostgreSQL database name
- `DB_USER` - PostgreSQL database user
- `DB_PASSWORD` - PostgreSQL database password
- `DB_HOST` - PostgreSQL database host (default: localhost)
- `DB_PORT` - PostgreSQL database port (default: 5432)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time (default 2 days)
- `CORS_ORIGIN` - Allowed CORS origin
- `OTP_STATIC_CODE` - Development OTP to send (use 12345 while prototyping)
- `OTP_EXPIRY_MINUTES` - How long the OTP is valid
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON as a string (for production/cloud deployments)

## Firebase Configuration

### For Local Development

1. Download your Firebase service account JSON file from Firebase Console
2. Place it at `src/config/firebase-service-account.json`
3. The app will automatically load it from the file

### For Production/Cloud Deployments (Render.com, Railway, etc.)

1. **Convert the JSON file to environment variable format:**
   ```bash
   node scripts/convert-firebase-to-env.js
   ```
   This will output the JSON as a single-line string.

2. **Set the environment variable in your hosting platform:**
   - **Render.com**: Go to your service → Environment → Add Environment Variable
     - Key: `FIREBASE_SERVICE_ACCOUNT`
     - Value: [paste the JSON string from step 1]
   - **Railway**: Settings → Variables → Add Variable
   - **Heroku**: `heroku config:set FIREBASE_SERVICE_ACCOUNT='...'`

3. **Important**: The JSON string must be on a single line. Make sure to escape quotes properly if setting via command line.

**Note**: The `firebase-service-account.json` file is in `.gitignore` and should never be committed to version control.

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Helmet.js for security headers
- CORS enabled for cross-origin requests
- Input validation using express-validator

## License

ISC

