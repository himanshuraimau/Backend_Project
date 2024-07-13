# YouTube-like Backend Service

This project is a backend service designed to support a YouTube-like application. It provides various functionalities such as managing users, videos, comments, playlists, subscriptions, tweets, and more.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [User](#user)
  - [Video](#video)
  - [Comment](#comment)
  - [Dashboard](#dashboard)
  - [Health Check](#health-check)
  - [Like](#like)
  - [Playlist](#playlist)
  - [Subscription](#subscription)
  - [Tweet](#tweet)
- [Contributing](#contributing)
- [License](#license)

## Features

- User management (registration, login, profile update, avatar and cover image management, password change, authentication with JWT)
- Video management (upload, delete, update, publish, get video details, toggle publish status)
- Commenting on videos
- Creating and managing playlists
- Liking videos, comments, and tweets
- Subscribing to channels and managing subscriptions
- Health check endpoint
- Dashboard for administrative tasks
- Tweet functionality
- User channel profile and watch history

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   ```
2. Navigate to the project directory:
   ```bash
   cd your-repo-name
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   - Rename the `.env.example` file to `.env`:
     ```bash
     mv .env.example .env
     ```
   - Update the values in the `.env` file with your own configuration:
     ```env
     PORT=8000
     MONGODB_URI=mongodb+srv://xyz:your-password@cluster0.lxl3fsq.mongodb.net
     CORS_ORIGIN=*
     ACCESS_TOKEN_SECRET=random-secret
     ACCESS_TOKEN_EXPIRY=1d
     REFRESH_TOKEN_SECRET=random-secret
     REFRESH_TOKEN_EXPIRY=10d
     CLOUDINARY_CLOUD_NAME=your-cloud-name
     CLOUDINARY_API_KEY=your-api-key
     CLOUDINARY_API_SECRET=your-api-secret
     ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```
2. The server will be running at `http://localhost:8000`.

## API Endpoints

### User

- **POST /users/register** - Register a new user with avatar and cover image
- **POST /users/login** - User login
- **POST /users/logout** - User logout (requires authentication)
- **POST /users/refresh-token** - Refresh access token (requires authentication)
- **POST /users/change-password** - Change user password (requires authentication)
- **GET /users/current-user** - Get current user details (requires authentication)
- **PATCH /users/update-account** - Update user account details (requires authentication)
- **PATCH /users/update-avatar** - Update user avatar (requires authentication)
- **PATCH /users/update-cover-image** - Update user cover image (requires authentication)
- **GET /users/c/:username** - Get user channel profile (requires authentication)
- **GET /users/history** - Get user watch history (requires authentication)

### Video

- **GET /videos** - Get all videos
- **POST /videos** - Publish a new video with video file and thumbnail upload
- **GET /videos/:videoId** - Get video details
- **PATCH /videos/:videoId** - Update video details with optional thumbnail upload
- **DELETE /videos/:videoId** - Delete a video
- **PATCH /videos/toggle/publish/:videoId** - Toggle publish status of a video (requires authentication)

### Comment

- **GET /comments/:videoId** - Get comments for a video
- **POST /comments/:videoId** - Add a comment to a video
- **PATCH /comments/c/:commentId** - Update a comment (requires authentication)
- **DELETE /comments/c/:commentId** - Delete a comment (requires authentication)

### Dashboard

- **GET /dashboard/stats** - Get channel statistics (requires authentication)
- **GET /dashboard/videos** - Get all videos for the channel (requires authentication)

### Health Check

- **GET /healthcheck** - Check the health of the service

### Like

- **POST /likes/toggle/v/:videoId** - Like or unlike a video (requires authentication)
- **POST /likes/toggle/c/:commentId** - Like or unlike a comment (requires authentication)
- **POST /likes/toggle/t/:tweetId** - Like or unlike a tweet (requires authentication)
- **GET /likes/videos** - Get liked videos for the user (requires authentication)

### Playlist

- **POST /playlists** - Create a new playlist (requires authentication)
- **GET /playlists/:playlistId** - Get playlist details (requires authentication)
- **PATCH /playlists/:playlistId** - Update playlist details (requires authentication)
- **DELETE /playlists/:playlistId** - Delete a playlist (requires authentication)
- **PATCH /playlists/add/:videoId/:playlistId** - Add a video to a playlist (requires authentication)
- **PATCH /playlists/remove/:videoId/:playlistId** - Remove a video from a playlist (requires authentication)
- **GET /playlists/user/:userId** - Get playlists of a user (requires authentication)

### Tweet

- **POST /tweets** - Create a new tweet (requires authentication)
- **GET /tweets/:tweetId** - Get tweet details
- **PATCH /tweets/:tweetId** - Update a tweet (requires authentication)
- **DELETE /tweets/:tweetId** - Delete a tweet (requires authentication)

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any improvements.