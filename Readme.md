# 💪 GymVault

> **Train Smarter. Track Every Rep.**

GymVault is a modern, offline-first workout tracking application inspired by apps like Hevy and Strong. It is designed with a clean architecture, scalable codebase, and production-quality engineering practices.

The goal is **not simply to clone an existing application**, but to build a professional fitness platform that can grow into a complete ecosystem.

---

# Vision

GymVault helps users

* Track workouts
* Build workout routines
* Monitor strength progress
* View analytics
* Track body measurements
* Set personal records
* Stay consistent

Future versions may include

* AI Workout Coach
* Nutrition Tracking
* Social Features
* Wearables Integration
* HealthKit / Google Fit
* Premium Subscription

---

# Technology Stack

## Mobile

* React Native
* Expo
* TypeScript
* Expo Router
* NativeWind
* Zustand
* TanStack Query
* React Hook Form
* Zod
* React Native MMKV
* React Native Reanimated
* React Native Gesture Handler
* FlashList
* React Native SVG

---

## Backend

* NestJS
* MongoDB
* Mongoose
* JWT Authentication
* Refresh Tokens
* Swagger
* Docker

---

## Development

* TypeScript
* ESLint
* Prettier
* Husky
* GitHub Actions
* Jest

## Running the Mobile App

The mobile application is a self-contained Expo project located inside `apps/mobile/` with its own `node_modules` and local lockfile.

To run the application:

1. Navigate to the mobile directory:
   ```bash
   cd apps/mobile
   ```
2. Start the project:
   ```bash
   npm install      # Install dependencies locally
   npm run android  # Run on Android emulator/device
   npm run ios      # Run on iOS simulator/device
   npm start        # Start the Metro bundler
   ```

---

# Architecture Principles

GymVault must always follow

* Clean Architecture
* SOLID Principles
* Feature-Based Architecture
* Modular Design
* Repository Pattern
* Reusable Components
* Offline First

Never sacrifice architecture for speed.

Every feature should be easy to maintain.

---

# Project Structure

```
GymVault/

apps/

    mobile/

    api/

packages/

    ui/

    config/

    types/

    constants/

    validation/

docs/

scripts/
```

---

# Mobile Structure

```
src/

app/

components/

features/

hooks/

services/

store/

theme/

utils/

constants/

types/

assets/
```

Each feature should contain its own

```
components/

hooks/

screens/

services/

types/

store/
```

Avoid dumping everything inside a global components folder.

---

# Backend Structure

```
src/

auth/

users/

workouts/

sessions/

exercises/

history/

analytics/

progress/

notifications/

common/

database/

config/
```

Every module should contain

```
controller

service

repository

dto

entities

schemas

guards

interfaces
```

---

# Design Philosophy

The application should feel similar to

* Hevy
* Strong
* Apple Fitness

Characteristics

* Dark Mode First
* Large Typography
* Smooth Animations
* Rounded Cards
* Minimal Interface
* Fast Navigation
* One-Hand Friendly

---

# State Management

Use

* Zustand → UI State
* React Query → Server State
* React Hook Form → Forms
* MMKV → Local Cache

Do NOT use React Context for global application state.

---

# Navigation

Use Expo Router.

Feature routes should remain grouped.

Example

```
(app)

(home)

(workout)

(history)

(profile)

(auth)
```

---

# API Rules

Always use REST APIs.

Example

```
POST /auth/login

POST /auth/register

GET /users/me

GET /workouts

POST /workouts

PATCH /workouts/:id

DELETE /workouts/:id
```

Never expose MongoDB models directly.

Always use DTOs.

---

# API Response Format

Success

```json
{
  "success": true,
  "message": "Workout created successfully",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Workout not found",
  "errors": []
}
```

Maintain consistent responses throughout the API.

---

# Authentication

Support

* Login
* Register
* Refresh Token
* Logout
* Forgot Password
* Reset Password

Store

Access Token

→ Secure Storage

Refresh Token

→ Secure Storage

Never store JWTs in MMKV.

---

# Offline First

GymVault should continue functioning without internet.

When offline

* Save workouts locally
* Save workout history
* Queue API requests

When internet returns

* Automatically synchronize
* Resolve conflicts safely

Offline functionality is a core feature.

---

# Error Handling

Always

* Display friendly error messages
* Retry failed requests when appropriate
* Log unexpected errors
* Never crash because of API failures

---

# Performance

Avoid unnecessary renders.

Use

* memo
* useMemo
* useCallback
* FlashList
* Lazy Loading

Optimize every large list.

---

# Database

Collections

```
users

exercises

workouts

sessions

sessionSets

history

personalRecords

bodyMeasurements

progressPhotos

notifications
```

Use indexes where appropriate.

Never duplicate data unnecessarily.

---

# Exercise Database

Each exercise should contain

* Name
* Description
* Instructions
* Muscle Groups
* Secondary Muscles
* Equipment
* Difficulty
* Images
* Videos

Design this module for future expansion.

---

# Features

## Version 0.1

Authentication

Exercise Database

Workout Builder

Workout Tracking

History

Profile

Dark Theme

---

## Version 0.2

Personal Records

Body Weight

Measurements

Charts

Statistics

---

## Version 0.3

Workout Templates

Exercise Search

Favorites

Workout Duplication

Calendar

---

## Version 0.4

Cloud Sync

Notifications

Backup

Export

---

## Version 1.0

AI Workout Coach

Nutrition

Social

Premium

Wearables

---

# Coding Standards

Always

* Use TypeScript
* Use strict typing
* Avoid any
* Write reusable components
* Keep functions small
* Separate UI from business logic
* Write descriptive names
* Avoid duplicated code

---

# Naming Conventions

Components

```
WorkoutCard.tsx
```

Hooks

```
useWorkout.ts
```

Stores

```
workout.store.ts
```

Services

```
workout.service.ts
```

DTOs

```
create-workout.dto.ts
```

Schemas

```
workout.schema.ts
```

---

# UI Rules

Create reusable components.

Examples

```
Button

TextField

Card

Modal

Avatar

Badge

EmptyState

LoadingIndicator

BottomSheet

ConfirmationDialog
```

Never create duplicate UI components.

---

# Documentation

Every feature should include

* Purpose
* Flow
* API Endpoints
* Data Models
* Future Improvements

Keep documentation current as the code evolves.

---

# Git Workflow

Branches

```
main

develop

feature/*
```

Commit example

```
feat(workout): add workout duplication

fix(auth): refresh token issue

refactor(profile): optimize state handling
```

---

# AI Development Rules

When implementing features, the AI should:

1. Understand the existing architecture before writing code.
2. Reuse existing components and utilities whenever possible.
3. Avoid introducing duplicate logic.
4. Follow feature-based architecture.
5. Keep code modular and maintainable.
6. Preserve TypeScript strictness.
7. Consider offline-first behavior where applicable.
8. Optimize performance for mobile devices.
9. Add meaningful comments only when they improve understanding.
10. Ensure new features integrate cleanly with the current project structure.
11. Never install new libraries without a clear justification.
12. Prefer extending existing modules instead of creating parallel implementations.
13. Keep the UI consistent with the established design system.

---

# Definition of Done

A feature is considered complete only when it:

* Compiles without errors.
* Passes linting.
* Uses strict TypeScript.
* Handles loading, success, and error states.
* Supports dark mode.
* Is responsive across devices.
* Is documented.
* Includes appropriate validation.
* Is reusable and maintainable.
* Does not introduce duplicate logic.

---

# Long-Term Goal

GymVault should evolve into a production-quality fitness platform with clean architecture, excellent user experience, offline reliability, scalable backend services, and maintainable code suitable for publication on both Google Play and the Apple App Store.
