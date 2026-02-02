# EcoCred - MongoDB Migration & Chat Widget Setup

This application has been migrated from localStorage to MongoDB for persistent data storage and includes an AI-powered chat widget.

## Environment Setup

Create a `.env.local` file in the root directory with the following content:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ecocred

# OpenRouter API Key for Chat Widget
OPENROUTER_API_KEY=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

# For production with authentication:
# MONGODB_URI=mongodb://username:password@host:port/database

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecocred
```

## Running with Docker Compose (Recommended)

1. Install Docker and Docker Compose
2. Run the application with MongoDB:

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Next.js app on port 3000

## Running Locally

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB locally (if not using Docker):
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or install MongoDB locally
```

3. Start the development server:
```bash
npm run dev
```

## Database Initialization

The application will automatically initialize demo data when first started. This includes:
- Demo users (students and teachers)
- Sample tasks
- Global statistics

## Chat Widget Features

The app now includes an AI-powered chat widget that:

- **Always Available**: Floating chat button in bottom-right corner
- **Environmental Focus**: Specialized in eco-friendly topics and sustainability
- **Real-time Responses**: Powered by OpenRouter's GPT model
- **Context Aware**: Maintains conversation history
- **User Friendly**: Clean, modern interface with typing indicators

### Chat Widget Usage

1. Click the chat icon in the bottom-right corner
2. Ask questions about:
   - Environmental topics
   - Sustainability practices
   - Eco-friendly activities
   - Climate change
   - Renewable energy
   - Waste management
   - And more!

## API Endpoints

The following API endpoints are available:

- `GET /api/users` - Get all users
- `POST /api/users` - Create/update user
- `GET /api/users/user?userId=id` - Get user by ID
- `GET /api/users/user?email=email` - Get user by email
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks?taskId=id` - Get task by ID
- `POST /api/tasks` - Create/update task
- `GET /api/submissions` - Get all submissions
- `GET /api/submissions?studentId=id` - Get submissions by student
- `GET /api/submissions?taskId=id` - Get submissions by task
- `POST /api/submissions` - Create/update submission
- `GET /api/stats` - Get global statistics
- `POST /api/stats` - Update global statistics
- `GET /api/lessons?userId=id&lessonId=id&action=progress` - Get lesson progress
- `GET /api/lessons?userId=id&action=count` - Get completed lessons count
- `POST /api/lessons` - Complete lesson
- `POST /api/init` - Initialize demo data
- `POST /api/chat` - Chat with AI assistant

## Migration Notes

- All localStorage functions have been replaced with API calls
- Session management still uses localStorage for user authentication
- Data is now persistent across browser sessions
- Multiple users can access the same data
- All CRUD operations now go through MongoDB

## Troubleshooting

1. **MongoDB Connection Issues**: Ensure MongoDB is running and the connection string is correct
2. **API Errors**: Check the browser console and server logs for detailed error messages
3. **Data Not Loading**: Ensure the `/api/init` endpoint has been called to initialize demo data
