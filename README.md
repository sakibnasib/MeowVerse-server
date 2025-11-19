# MeowVerse Server-Side

This is the backend API for the MeowVerse application, a platform for buying and selling cats and cat food products.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [API Endpoints](#api-endpoints)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

## Overview

MeowVerse is a full-stack web application that allows users to:
- Browse and purchase cats and cat food products
- Apply to become sellers
- Manage their orders and products
- Admin panel for managing users, sellers, and orders

## Features

- User authentication via Firebase
- Role-based access control (User, Seller, Admin)
- Product management (cats and cat food)
- Order management system
- Payment processing with Stripe
- Database operations with MongoDB

## Technologies Used

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Firebase Admin** - Authentication and backend services
- **Stripe** - Payment processing
- **CORS** - Cross-Origin Resource Sharing
- **Dotenv** - Environment variable management

## API Endpoints

### User Routes
- `GET /user` - Get all users
- `GET /user/:email` - Get user by email
- `POST /user` - Create or update user
- `PATCH /user/applied/:email` - Apply to become a seller

### Admin Routes
- `GET /admin/users` - Get all users with filtering and pagination
- `GET /admin/seller` - Get all sellers
- `GET /allseler/applied` - Get all applied sellers
- `PATCH /seller/approve/:id` - Approve seller application
- `PATCH /seller/reject/:id` - Reject seller application

### Product Routes
- `GET /cats` - Get latest cats (8 items)
- `GET /allcats` - Get all cats with search and pagination
- `GET /cats/:id` - Get cat by ID
- `POST /cats` - Create new cat listing
- `PATCH /seller/cats/:catId` - Update cat listing
- `DELETE /seller/cats/:catId` - Delete cat listing

- `GET /foods` - Get latest cat foods (8 items)
- `GET /allfoods` - Get all cat foods with search and pagination
- `GET /foods/:id` - Get cat food by ID
- `POST /catfoods` - Create new cat food listing
- `PATCH /seller/foods/:id` - Update cat food listing
- `DELETE /seller/catfood/:foodId` - Delete cat food listing

### Order Routes
- `GET /order/:email` - Get orders by user email
- `GET /sellerorder/:email` - Get orders by seller email
- `POST /orders` - Create new order
- `PATCH /orders/:orderId` - Update order status
- `DELETE /order/:id` - Delete order

### Payment Routes
- `POST /create-payment-intent` - Create Stripe payment intent
- `POST /payments` - Process payment

### Blog Routes
- `GET /blog` - Get all blog posts

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the required environment variables (see below).

4. Start the development server:
   ```bash
   node index.js
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
STRIPE_SK_KEY=your_stripe_secret_key
FB_SERVICE_KEY=your_firebase_service_account_key_base64
```

To generate the `FB_SERVICE_KEY`:
1. Run the [convertKey.js](file:///c%3A/MeowVerse-server-side/convertKey.js#L1-L4) script to convert your Firebase service account JSON to base64
2. Use the output as the value for `FB_SERVICE_KEY`

## Deployment

This application is configured for deployment on Vercel. The configuration can be found in [vercel.json](file:///c%3A/MeowVerse-server-side/vercel.json).

The application uses Vercel's Node.js runtime and is configured to handle all HTTP methods through the index.js entry point.
