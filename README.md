# Konkoor Arena

A full-stack online examination platform inspired by the Iranian Konkur system.

## Overview

Konkoor Arena is an educational platform that provides:
- Online exams
- Question bank management
- Student performance analysis
- Counselor and admin management
- Competitive exam features

## Current Features

### Authentication
- User registration
- User login
- JWT based authentication
- Role based access control

### User Management
- Student accounts
- Counselor accounts
- Admin accounts
- User profile

### Examination System
- Exam structure
- Booklet management
- Attempt tracking

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL (planned migration)
- Prisma ORM (planned migration)
- JWT
- Zod Validation
- bcrypt

## Project Architecture

src/

├── controllers

├── models

├── routes

├── services

├── middleware

└── validations


## Database

The project initially used MongoDB with Mongoose.

The database layer is being migrated to PostgreSQL using Prisma ORM to provide:
- Better relational data modeling
- Improved scalability
- Stronger data consistency

## Roadmap

- [x] Express backend setup
- [x] MongoDB integration
- [x] User authentication
- [x] JWT authorization
- [x] Role based access control
- [x] Examination core models
- [ ] PostgreSQL migration
- [ ] Question bank
- [ ] Exam creation panel
- [ ] Student exam experience
- [ ] Answer analysis
- [ ] AI powered analysis

## Installation

...

## Environment Variables

...

## License

Private project