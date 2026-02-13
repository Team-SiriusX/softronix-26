# Quick Start Guide

This guide will help you get the Softronix project up and running quickly.

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js 20+ installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] PostgreSQL database (local or remote)
- [ ] Resend account for emails
- [ ] UploadThing account (optional for now)
- [ ] Upstash account (optional for now)
- [ ] OpenRouter API key (optional for now)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and fill in your values
# REQUIRED:
#   - DATABASE_URL
#   - BETTER_AUTH_SECRET (generate random string)
#   - RESEND_API_KEY
#   - RESEND_EMAIL
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations to create tables
pnpm prisma migrate dev

# (Optional) Open Prisma Studio to view database
pnpm prisma studio
```

### 4. Start Development Server

```bash
pnpm dev
```

Visit http://localhost:3000 - You should see the landing page!

## Testing the Setup

### Test 1: Landing Page
- Navigate to http://localhost:3000
- You should see a clean boilerplate landing page

### Test 2: Authentication Flow
1. Click "Sign Up" in the navigation
2. Fill in the form and submit
3. Check your email for verification link
4. Click the verification link
5. You should be automatically signed in

### Test 3: Sample CRUD
1. Make sure you're signed in
2. Navigate to http://localhost:3000/sample
3. Try creating and deleting sample items

### Test 4: Database Check
```bash
pnpm prisma studio
```
- Check if User table has records
- Verify Session table for active sessions

## Common Issues & Solutions

### Issue: Prisma Client Not Found
**Solution:**
```bash
pnpm prisma generate
```

### Issue: Database Connection Failed
**Solution:**
- Check your DATABASE_URL in .env
- Make sure PostgreSQL is running
- Verify database exists

### Issue: Email Not Sending
**Solution:**
- Verify RESEND_API_KEY is correct
- Check RESEND_EMAIL is a verified domain in Resend
- Look at server logs for specific error

### Issue: Port 3000 Already in Use
**Solution:**
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or use different port:
pnpm dev -p 3001
```

## What's Next?

Now that you have the project running, check out the main README.md for:
- Full feature documentation
- Architecture patterns
- API documentation
- Development roadmap
- Feature ideas

## Development Workflow

### Adding a New Feature

1. **Plan** - Check README.md "Planning Your Next Steps"
2. **Database** - Update schema.prisma if needed
3. **Migrate** - Run `pnpm prisma migrate dev --name feature_name`
4. **API** - Add routes in `src/app/api/[[...route]]/controllers/`
5. **UI** - Create pages/components
6. **Test** - Verify functionality

### Best Practices

- Run `pnpm lint` before committing
- Keep API routes in controllers
- Use TypeScript strictly
- Leverage existing UI components from shadcn/ui
- Follow the folder structure conventions

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review the [Project Structure](./README.md#-project-structure)
- See [Troubleshooting](./README.md#-troubleshooting) section

---

**Pro Tip:** Use `pnpm prisma studio` frequently to visually inspect your database as you develop!
