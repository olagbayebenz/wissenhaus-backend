# Resend Email Setup Guide

This project uses Resend for transactional emails. Follow these steps to set it up.

## 1. Create a Resend Account

1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email

## 2. Set Up Your Domain (Optional but Recommended)

For production, add your custom domain:

1. In Resend dashboard, go to "Domains"
2. Add your domain (e.g., wissenhaus.org)
3. Follow DNS verification steps
4. Once verified, emails will be sent from noreply@wissenhaus.org

For testing, use Resend's default domain (emails sent from *.resend.dev)

## 3. Get Your API Key

1. Go to Resend API Keys section
2. Create a new API key
3. Copy the key (starts with `re_`)

## 4. Configure Environment Variables

Add to `.env` file:

```env
RESEND_API_KEY=re_your_api_key_here
```

## 5. Email Address Configuration

The email service is configured with:
- **From Email**: noreply@wissenhaus.org (update in emailService.js if needed)
- **Admin Email**: info@wissenhaus.org (update in emailService.js if needed)

## 6. Email Templates

Three email templates are included:

### Mentor Application
- Sent when someone applies to become a mentor
- Includes application details and confirmation message

### Trainer Application
- Sent when someone applies to become a trainer
- Includes expertise areas selected by applicant

### Operations Application
- Sent when someone applies for operations team
- Includes areas of interest

All templates also trigger an admin notification email.

## 7. Testing

### Test in Development

1. Set `RESEND_API_KEY` to a test key in `.env`
2. Submit a form through the application
3. Check email in Resend dashboard under "Emails"

### Using Resend Test Mode

```javascript
// For testing without sending real emails
const resend = new Resend('re_test_' + process.env.RESEND_API_KEY);
```

## 8. Email Sending Flow

### Application Form Submission

1. User submits form on frontend (mentor-application.html, etc.)
2. Data saved to Supabase directly
3. Frontend makes async call to backend API
4. Backend receives submission data
5. Backend sends two emails:
   - **Confirmation email** to applicant (using template)
   - **Notification email** to admin with full details

### Error Handling

- Email failures are logged but don't block form submissions
- Users always see success confirmation, even if email fails
- Admins receive error logs via monitoring

## 9. Customizing Email Templates

Edit email templates in `/src/services/emailService.js`:

```javascript
const emailTemplates = {
  mentorApplication: (data) => ({
    subject: 'Your custom subject',
    html: `<div>Your custom HTML</div>`
  })
};
```

Variables available in templates:
- `data.firstName` - First name
- `data.lastName` - Last name
- `data.email` - Email address
- `data.phone` - Phone number
- `data.city` - City
- `data.experience` - Experience/background text
- `data.expertise` - Array of expertise areas (trainer)
- `data.areas` - Array of interest areas (operations)

## 10. Monitoring and Debugging

### Check Email Sending

1. Go to Resend dashboard
2. Click "Emails" section
3. Filter by recipient or status
4. View delivery status and error messages

### Logs

Check backend logs for:
- `console.log('Email sent:', response)` - successful sends
- `console.error('Error sending email:', error)` - failures

### Common Issues

**Email not sending:**
- Check API key is valid in .env
- Verify RESEND_API_KEY environment variable is loaded
- Check recipient email is correct
- Review Resend dashboard for any delivery issues

**Domain verification failed:**
- Ensure DNS records are correctly added
- Wait a few minutes for DNS propagation
- Check Resend domain settings for exact DNS records needed

**Template not rendering:**
- Verify HTML syntax in emailTemplates
- Check template variable names match data object
- Test with static HTML first

## 11. Production Deployment

When deploying to production:

1. Add `RESEND_API_KEY` to Vercel environment variables:
   ```bash
   vercel env add RESEND_API_KEY
   ```

2. Update email addresses in emailService.js:
   - FROM: noreply@yourdomain.com
   - ADMIN: admin@yourdomain.com

3. Verify custom domain in Resend (if using one)

4. Test form submission on production URL

5. Monitor Resend dashboard for delivery status

## 12. Pricing and Limits

- **Free tier**: 100 emails/day (or 3,000/month)
- **Paid tier**: Pay-as-you-go, $0.10 per email after free tier
- **Rate limit**: 1000 requests/second

For the early stage of Wissen-Haus, the free tier is sufficient.

## Troubleshooting

If emails aren't being sent:

1. Verify RESEND_API_KEY is set correctly
2. Check backend logs for error messages
3. Confirm backend is running and receiving requests
4. Test with a simple curl request to Resend API
5. Check Resend dashboard for delivery status

```bash
# Test Resend API
curl -X POST https://api.resend.com/emails \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "test@example.com",
    "subject": "Hello World",
    "html": "<strong>It works!</strong>"
  }'
```
