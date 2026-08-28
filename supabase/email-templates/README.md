# Rooted Daily - Email Templates

## 📧 Branded Email Templates for Supabase Auth

This folder contains all 5 custom-branded email templates for Rooted Daily authentication flows.

### Templates Included:

1. **01-confirm-signup.html** - Welcome email with email confirmation
2. **02-magic-link.html** - Passwordless sign-in link
3. **03-invite-user.html** - User invitation email
4. **04-reset-password.html** - Password reset request
5. **05-change-email.html** - Email address change confirmation

---

## 🎨 Design Features:

- **Brand Colors**: Earthy brown gradient (#8B7355 → #6B5645)
- **Responsive Layout**: Works on all devices
- **Clear CTAs**: Large, prominent action buttons
- **Security Alerts**: Color-coded warning boxes
- **Professional Footer**: Consistent branding across all emails

---

## 🚀 How to Install in Supabase:

### Step 1: Go to Email Templates
1. Open your Supabase dashboard: https://supabase.com/dashboard/project/fmzjmjyqqooctsusfqca
2. Navigate to: **Authentication → Email Templates** (left sidebar)

### Step 2: Upload Each Template
For each of the 5 templates:

1. Click on the template name in Supabase (e.g., "Confirm signup")
2. Delete the default template
3. Copy the HTML from the corresponding file in this folder
4. Paste into the Supabase editor
5. Click **Save**

---

## 🔧 Template Variables:

Each template uses Supabase variables that are automatically replaced:

- `{{ .ConfirmationURL }}` - The action link (confirm email, reset password, etc.)
- `{{ .Email }}` - The recipient's email address
- `{{ .Token }}` - Security token (if needed)
- `{{ .SiteURL }}` - Your app's URL

**Don't change these!** Supabase replaces them automatically.

---

## ✅ Template Mapping:

| Supabase Setting | Use This File |
|-----------------|---------------|
| Confirm signup | 01-confirm-signup.html |
| Magic Link | 02-magic-link.html |
| Invite user | 03-invite-user.html |
| Reset password | 04-reset-password.html |
| Change email address | 05-change-email.html |

---

## 🎯 What Each Template Does:

### 1. Confirm Signup
- Sent when a new user creates an account
- Includes welcome message and features list
- Confirms email ownership

### 2. Magic Link
- Passwordless sign-in option
- Expires in 24 hours
- No password required

### 3. Invite User
- Sent when someone invites a friend
- Explains what Rooted Daily offers
- Creates account on acceptance

### 4. Reset Password
- Sent when user forgets password
- Security warning for unauthorized requests
- Expires in 1 hour

### 5. Change Email
- Confirms new email address
- Explains what happens after confirmation
- Security alert for unauthorized changes

---

## 📱 Testing:

After uploading, test each template:

1. **Signup**: Create a new test account
2. **Magic Link**: Use "Sign in with magic link" option
3. **Reset Password**: Click "Forgot password"
4. **Change Email**: Update email in settings

Check your inbox to see the branded emails!

---

## 🎨 Customization:

To customize colors, find these values in each template:

```css
background: linear-gradient(135deg, #8B7355 0%, #6B5645 100%);  /* Main brand color */
color: #8B7355;  /* Accent color */
```

Replace `#8B7355` with your preferred brand color.

---

## ✨ Brand Identity:

**Colors:**
- Primary: `#8B7355` (Warm Brown)
- Secondary: `#6B5645` (Dark Brown)
- Background: `#f5f5f0` (Off-white)

**Typography:**
- Headings: Georgia serif (traditional)
- Body: System sans-serif (modern, readable)

**Tone:**
- Warm and welcoming
- Faith-focused
- Community-oriented
- Professional yet approachable

---

## 📞 Support:

If you need to modify these templates or add new ones, all files are in:
`/supabase/email-templates/`

Keep this folder in your repository so you can track changes and restore templates if needed!

---

**Happy Emailing! 🙏✨**
