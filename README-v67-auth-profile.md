# V67 — Phone Authentication, Verification, Profile Completion & Role Dashboard

Base: `V66.1 Sticker Duration`

## Main changes

- Email-based authentication replaced with mobile-number authentication.
- Registration requires first name, last name, mobile number and password.
- Login requires mobile number and password.
- Registration and login both require a server-generated math CAPTCHA.
- Registration sends a 6-digit SMS verification code.
- Login sends a 6-digit SMS verification code after the password is validated.
- Verification codes expire after 2 minutes, allow 5 attempts and have a 60-second resend cooldown.
- Verification codes are stored hashed in `VerificationCode`.
- SMS provider abstraction:
  - `SMS_MODE=console` for local development (prints the code in the server console).
  - `SMS_MODE=kavenegar` for real SMS using Kavenegar Verify Lookup.
- After successful verification, the user is logged in and redirected to `/dashboard`.
- Dashboard now contains a `تکمیل پروفایل` / `ویرایش اطلاعات` card.
- Required profile fields: birth date, major, grade.
- Optional profile fields: email, national ID, address, city, province.
- The separate `/admin` dashboard route has been removed.
- Dashboard content is role-aware for `ADMIN`, `COUNSELOR`, `QUESTION_DESIGNER`, and `STUDENT`.
- Student-specific dashboard cards are hidden for staff roles.

## Database migration

New migration:
`prisma/migrations/20260910090000_phone_auth_profile/migration.sql`

Run:

```bash
npx prisma migrate deploy
npx prisma generate
```

`phoneNumber` is nullable in the database schema so existing users can remain in the database during migration. New registration always requires a verified phone number. Existing accounts without a phone number must be assigned one before they can use phone login.

## SMS configuration

Local development:

```env
SMS_MODE=console
```

The verification code will be printed in the backend console.

Real Kavenegar SMS:

```env
SMS_MODE=kavenegar
KAVENEGAR_API_KEY=your_api_key
KAVENEGAR_VERIFY_TEMPLATE=your_template_name
```

## Admin seed

The seed now supports:

```env
SEED_ADMIN_PHONE=09120000000
SEED_ADMIN_EMAIL=admin@griffin.local
SEED_ADMIN_PASSWORD=ChangeMe123!
```

Change these values before using the seed in a real environment.

## Recommended test flow

1. Run the migration and Prisma generate.
2. Start backend with `SMS_MODE=console`.
3. Register a new account.
4. Copy the 6-digit code from backend console.
5. Verify the phone; the user should enter `/dashboard` automatically.
6. Complete birth date, major and grade.
7. Refresh: the card should now be `ویرایش اطلاعات`.
8. Log out.
9. Login using phone + password + CAPTCHA.
10. Copy the new login code from backend console and verify it.
11. Confirm direct redirect to dashboard.
12. Test an `ADMIN` and a `QUESTION_DESIGNER` account and confirm each sees only its role-specific dashboard tools.
13. Confirm `/admin` no longer exists.
