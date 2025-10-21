# 🎯NextJs Modern Issue Tracker Application

A modern, full-stack issue tracking application built with Next.js, featuring real-time notifications, role-based permissions, and a beautiful UI.

## ✨ Features

### 🔐 Authentication & Authorization

- **User Registration & Login** with JWT-based authentication
- **Role-based Access Control** (USER/ADMIN roles)
- **Protected Routes** with automatic redirects
- **Session Management** with secure cookies

### 📋 Issue Management

- **Create, Read, Update, Delete** issues
- **Status Management** (Open/Closed) - Admin only for closing
- **Rich Text Descriptions** with proper formatting
- **Author Attribution** with role badges
- **Timestamps** for creation and updates

### 💬 Comments System

- **Add Comments** to any issue
- **Real-time Updates** via Server-Sent Events (SSE)
- **Author Information** with role indicators
- **Chronological Ordering** of comments

### 🔄 Real-time Notifications

- **Live Updates** when comments are added
- **Server-Sent Events (SSE)** for instant notifications
- **Auto-reconnection** with health monitoring
- **Toast Notifications** for user feedback

### 📊 Advanced Features

- **Server-side Pagination** for performance
- **Frontend Search** by title, description, or author
- **Status Filtering** (All/Open/Closed)
- **Responsive Design** for all devices
- **Error Boundaries** with graceful error handling

### 🎨 Modern UI/UX

- **Vibrant Color Scheme** with gradients and modern design
- **Loading States** with consistent spinners
- **Success Feedback** via toast notifications
- **Mobile-first** responsive design
- **Accessibility** compliant with ARIA labels

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL
- **Authentication**: JWT with secure cookies
- **Styling**: Tailwind CSS with custom components
- **Real-time**: Server-Sent Events (SSE)
- **Validation**: Zod schemas

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL database
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd issue-tracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="mysql://username:password@localhost:3306/issue_tracker"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

5. **Start the development server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── issues/        # Issue management endpoints
│   │   ├── notifications/ # SSE endpoint
│   │   └── health/        # Health check endpoint
│   ├── issues/            # Issue pages
│   ├── login/             # Authentication pages
│   └── signup/
├── components/            # Reusable UI components
├── contexts/              # React contexts (Auth, Toast)
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
└── styles/                # Global styles
```

## 🔑 User Roles & Permissions

### 👤 USER Role

- ✅ Create issues
- ✅ View all issues
- ✅ Edit own issues
- ✅ Delete own issues
- ✅ Add comments
- ✅ Edit own comments
- ✅ Delete own comments

### 👑 ADMIN Role

- ✅ All USER permissions
- ✅ Edit any issue
- ✅ Delete any issue
- ✅ **Close issues** (exclusive to admins)
- ✅ Edit any comment
- ✅ Delete any comment

## 🔄 Real-time Features

The application includes real-time notifications using Server-Sent Events:

- **Live Comment Updates**: See new comments instantly without refreshing
- **Connection Status**: Visual indicator of real-time connection (dev mode only)
- **Auto-reconnection**: Automatic reconnection with exponential backoff
- **Health Monitoring**: Regular health checks with `/api/health` endpoint

## 📱 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Issues

- `GET /api/issues` - List issues (with pagination & filtering)
- `POST /api/issues` - Create new issue
- `GET /api/issues/[id]` - Get specific issue
- `PUT /api/issues/[id]` - Update issue
- `DELETE /api/issues/[id]` - Delete issue

### Comments

- `GET /api/issues/[id]/comments` - Get issue comments
- `POST /api/issues/[id]/comments` - Add comment
- `DELETE /api/comments/[id]` - Delete comment

### Real-time

- `GET /api/notifications` - SSE endpoint for real-time updates
- `GET /api/health` - Health check endpoint

## 🧪 Testing

### E2E Testing with Playwright

```bash
# Install Playwright browsers (one-time setup)
npx playwright install

# Run basic E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed
```

### Manual Testing

```bash
# Start the development server
npm run dev

# Run integration tests
node scripts/test-sse.js
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

- Set `NODE_ENV=production`
- Use a secure `JWT_SECRET`
- Configure production database URL
- Set up proper CORS if needed

## 🎨 Customization

### Colors & Styling

The application uses a modern color scheme defined in `src/app/globals.css`:

- Primary: Blue gradients
- Secondary: Purple accents
- Success: Emerald green
- Error: Red tones

### Adding New Features

1. Define API routes in `src/app/api/`
2. Create UI components in `src/components/`
3. Add pages in `src/app/`
4. Update permissions in `src/lib/permissions.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Review the API documentation above
2. Check browser console for client-side errors
3. Review server logs for backend issues

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
