# 🧳 Travel Buddy & Meetup

## 1. Project Overview
Travel Buddy & Meetup Platform aims to create meaningful connections among travelers by helping them find compatible companions for upcoming trips. This subscription-based platform allows users to discover others heading to similar destinations and plan meetups, transforming solo journeys into shared adventures. The platform combines social networking and travel planning to enhance shared experiences and build a vibrant community of explorers.

This project blends social interaction and travel discovery, empowering users to explore the world together.

## 2. Objectives
- Build a social-travel web platform for connecting travelers.
- Enable trip sharing, traveler matching.
- Allow users to create detailed travel profiles and itineraries.
- Provide a secure and engaging UI/UX with modern features.
- Implement role-based authentication and persistence.

## 3. Core Features Breakdown

### 3.1 User Authentication & Roles
- **Register / Login**:
  - Email & Password
- **Roles**:
  - **User**: Can create travel plans, match with others.
  - **Admin**: Can manage users, travel plans, and content.
- **Security**: JWT-based Auth, secure password hashing.

### 3.2 User Profile Management (CRUD)
- **Create & Edit Profile**:
  - Full Name
  - Profile Image (via Cloudinary)
  - Bio / About
  - Travel Interests (e.g., hiking, food tours, photography)
  - Visited Countries
  - Current Location
- **Public View**: Users can view others’ profiles.

### 3.3 Travel Plan Management (CRUD)
- **Manage Plans**:
  - Destination (country/city)
  - Start & End Dates
  - Budget Range
  - Travel Type (Solo, Family, Friends)
  - Short description or itinerary
- **Visibility**: Plans are visible to others for matchmaking & discovery.

### 3.4 Search & Matching System
- **Search Criteria**:
  - Destination
  - Date Range
  - Interests

### 3.5 Review & Rating System
- **Post-Trip**:
> **Note:** User can give each other a review after the trip is completed. User also can edit or delete the review.
  - Leave a rating (1–5 stars).
  - Write a detailed review.
- **Trust**: Display average rating and recent reviews on profile pages.

### 3.6 Payment Integration
- **Premium Features**:
  - Subscription plans (Monthly/Yearly) for using this platform.
  - Verified Badge purchase after the subscription.
- **Payment Gateways**:
  - SSLCommerz.

## 4. Pages & Functional Requirements
> **Note:** The pages listed below are examples to guide implementation. You must add additional pages and features as needed to meet all project requirements and create a complete, functional platform.

### 4.1 Navbar
- **When Logged Out**:
  - Logo (links to Home)
  - Explore Travelers
  - Find Travel Buddy
  - Login
  - Register
- **When Logged In (User)**:
  - Logo (links to Home)
  - Explore Travelers
  - My Travel Plans
  - Profile
  - Logout
- **When Logged In (Admin)**:
  - Logo (links to Home)
  - Admin Dashboard
  - Manage Users
  - Manage Travel Plans
  - Profile
  - Logout

> **Note:** Feel free to add other navigation options as needed.

### 4.2 Authentication Pages
- **`/register`**: Sign up with default role User.
- **`/login`**: Standard secure login.

### 4.3 Home / Landing Page (`/`)
- Landing page with top destinations and "Find Travel Buddies" CTA.
- Logged-in users see recommended matches.
- **How It Works**: Simple 3-step guide (Sign up, Create Plan, Find Buddy).
- **Testimonials**: Success stories from travelers who found companions.
> **Note:** Must have a minimum of 6 sections on the home page. Add other necessary sections as needed (e.g., Popular Destinations, Top-Rated Travelers, Why Choose Us, Travel Categories).

### 4.4 Profile Page (`/profile/[id]`)
- User info, visited countries, upcoming plans, reviews.
- Actions: Edit own profile.

### 4.5 Dashboard (`/dashboard`)
- **For Users**: Overview of upcoming travel plans, Matched travelers.
- **For Admin**: User Management, Travel Plan Management, Activity Management.

### 4.6 Travel Plans Page (`/travel-plans`)
- List user plans. Add/Edit/Delete buttons.
- **Add Plan (`/travel-plans/add`)**: Form for new plan details.

### 4.7 Search & Match Page (`/explore`)
- Inputs: Destination, Date, Travel Type.
- Results: Dynamic list of matched profiles.

### 4.8 Travel Plan Details Page (`/travel-plans/[id]`)
- Full itinerary, budget, and travel preferences.
- Host profile summary.
- **Action**: "Request to Join" button.


## 5. Optional Features
| Feature | Description |
| :--- | :--- |
| 📍 Map Integration | Show nearby travelers using Google Maps API |
| 📨 Notifications | In-app or push notifications |
| 📸 Media Sharing | Allow users to share trip photos |

## 6. Folder & API Structure
> **Note:** The folder structure below is a suggested starting point to organize your code. You can modify the structure add new folders or reorganize as needed to fit your implementation approach.

### 🗂 Folder Structure
```
frontend/
 ├── app/
 │   ├── (auth)/login, register
 │   ├── (user)/profile, travel-plans
 │   ├── components/
 │   ├── utils/
 │   └── styles/
backend/
 ├── src/
 │   ├── modules/
 │   │   ├── users/
 │   │   ├── travelPlans/
 │   │   ├── reviews/
 │   │   ├── payments/
 │   └── ...
```

### 🌐 API Endpoints
> **Note:** These are suggested API endpoints to implement core features. You must add, modify or remove endpoints as needed to support all functionality in your application.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/users/:id` | Get user profile |
| PATCH | `/api/users/:id` | Update profile |
| POST | `/api/travel-plans` | Create travel plan |
| GET | `/api/travel-plans` | Get all travel plans |
| GET | `/api/travel-plans/match` | Search & match travelers |
| POST | `/api/reviews` | Add review |
| POST | `/api/payments/create-intent` | Create payment intent |

### 💻 Tech Stack
-- Node.js
-- MondoDB
-- Mongoose
-- Express.js
-- bcrypt.js
-- zod
-- jsonwebtoken
-- cors
-- dotenv
-- cloudinary