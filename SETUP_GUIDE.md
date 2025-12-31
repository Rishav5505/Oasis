# Oasis JEE Classes - Setup Guide

## Database Seeding Instructions

After setting up the database, you need to seed it with initial data:

### 1. Seed Classes and Subjects
```bash
cd backend
node seedCoaching.js
```

This will create:
- Classes: Class 9, Class 10
- Subjects: Physics, Chemistry, Biology, Maths, English

### 2. Seed Exams (Required for Teacher Dashboard)
```bash
node seedExams.js
```

This will create:
- **Unit Tests**: 3 per class (Unit Test 1, 2, 3)
- **Monthly Tests**: 3 per class (January, February, March)
- **Final Exams**: 2 per class (Mid-Term, Final)

**Total**: 8 exams per class

### 3. Verify Seeding
Check the console output to confirm:
```
✅ Created 8 exams successfully!

📊 Exam Summary:
   Unit Tests: 3
   Monthly Tests: 3
   Final Exams: 2
   Total: 8
```

## Troubleshooting

### Issue: "Exam Cycle" dropdown is empty in Teacher Dashboard

**Solution:**
1. Run `node seedExams.js` in the backend directory
2. Refresh the Teacher Dashboard
3. Check browser console for "📚 Fetched Exams:" log
4. If still empty, verify MongoDB connection

### Issue: "No exams available" message

This means the database has no exam records. Follow step 2 above.

## Admin Credentials
- Email: admin@oasis.com
- Password: admon123

## Notes
- Always seed classes and subjects before seeding exams
- Exams are linked to classes, so classes must exist first
- You can customize exam names and dates in `seedExams.js`
