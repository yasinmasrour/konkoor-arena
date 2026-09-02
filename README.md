# Konkoor Arena

Konkoor Arena is a backend project for an Iranian educational and exam platform. The project is built with Node.js and Express.js and provides the backend infrastructure for user authentication, exams, questions, booklets, attempts, and real-time competitive features.

## Tech Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Zod
- Swagger / OpenAPI
- Socket.IO — real-time Arena communication

## Features

### Authentication & Authorization

- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Protected routes
- Role-based authorization
- Student and admin access control

### Questions

- Create and manage questions
- Retrieve questions
- Search and filtering
- Pagination
- Sorting
- Question validation
- Swagger API documentation

### Booklets

- Create and manage exam booklets
- Add questions to booklets
- Search and filtering
- Pagination
- Sorting
- Booklet validation

### Exams

- Create and manage exams
- Assign booklets to exams
- Exam date and time management
- Exam status management
- Validation and error handling

### Attempts

- Start an exam attempt
- Submit answers
- Validate submitted answers
- Calculate correct and incorrect answers
- Track unanswered questions
- Submit attempts
- View attempt results
- Review submitted attempts

### API Documentation

The backend APIs are documented using Swagger / OpenAPI.

Swagger provides an interactive interface for viewing and testing the available endpoints.

## Project Structure

```text
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── validations/
├── utils/
└── server.js
```

The project follows a layered backend architecture:
```text
 Routes
    ↓ 
 Controllers
    ↓ 
 Services
    ↓ 
 Prisma / Database 
```
This structure keeps HTTP handling, business logic, validation, and database operations separated and easier to maintain.

## Error Handling

The project uses a centralized error-handling system.
Application errors are handled through a custom ```AppError``` class, while Prisma errors are converted into appropriate API responses.

Common errors include:

- Unauthorized requests
- Forbidden requests
- Resource not found
- Validation errors
- Duplicate records
- Database constraint errors

## Validation
Request data is validated using Zod before reaching the corresponding controller or service.

This helps prevent invalid data from entering the application and provides consistent validation responses.

## Environment Variables
Create a ```.env``` file in the project root and configure the required environment variables.

Example:

```text
PORT=3000
DATABASE_URL="your_database_connection_string"
JWT_SECRET="your_jwt_secret"
```
Do not commit the .env file to the repository.

## Running the Project

Install dependencies:

```
npm install
```

Start the development server:

```
npm start
``` 

The server will run on:

```
http://localhost:3000 
```

## API

The project uses RESTful APIs for the main platform functionality.

Examples include:

```
/auth
/questions
/booklets
/exams
/attempts
```

API routes are documented through Swagger.

## Konkoor Arena

The project includes a real-time PvP section called Konkoor Arena.
The Arena is designed around competitive exam questions.

Each match will contain:

- 2 players
- 5 shared questions
- 3 lives for each player
- A time limit for each question
- Real-time answer submission
- Real-time match state synchronization
- Winner and draw conditions

The Arena system also includes:

- Real-time matchmaking
- Socket.IO communication
- Player ratings
- Seasonal leagues
- Leaderboards

The real-time game system will be developed separately from the regular exam attempt system while reusing the existing question and user infrastructure where appropriate.

## Development Status
The backend foundation and core educational platform features are currently under development.

Completed areas include:

- Project initialization
- Express server setup
- Backend architecture
- PostgreSQL database connection
- User model
- Authentication infrastructure
- Password hashing
- JWT authentication
- Request validation
- Centralized error handli
- ng
- Questions
- Booklets
- Exams
- Exam attempts
- Swagger API documentation

The next development phase is hardening the Arena game flow, reconnect handling, frontend game UI, and ranking/league integration.

## License

This project is currently a private development project.