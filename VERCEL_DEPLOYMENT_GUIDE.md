# Vercel Deployment Guide for Authentication

To make authentication work on Vercel, you need to configure Environment Variables and update your Google Cloud Console settings. You do **not** need to change your code if it works locally, but the environment needs to be set up correctly for production.

## 1. Vercel Environment Variables

Go to your Vercel Project Settings > **Environment Variables** and add the following:

| Variable Name | Value Description |
|--------------|-------------------|
| `NEXTAUTH_URL` | Your production URL (e.g., `https://your-project-name.vercel.app`). **Important**: Must include `https://`. |
| `NEXTAUTH_SECRET` | Use this generated secret: `SXRWbUhQjS98KSWRW9GFtbdXK8KpVVUqaNC/uhb48wc=` |
| `GOOGLE_CLIENT_ID` | Your Google Client ID (same as local `.env.local` if using the same project, but recommended to use a prod project). |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret. |

> **Note**: If you want to use the same Google Credentials as your local setup, you can copy them from your `.env.local` file.

## 2. Google Cloud Console Configuration

For Google Sign-In to work in production, Google needs to know your Vercel URL.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project.
3. Go to **APIs & Services** > **Credentials**.
4. Click on your **OAuth 2.0 Client ID**.
5. Under **Authorized JavaScript origins**, add your Vercel URL:
   - `https://your-project-name.vercel.app`
6. Under **Authorized redirect URIs**, add the callback URL:
   - `https://your-project-name.vercel.app/api/auth/callback/google`
7. Click **Save**.

## 3. Redeploy

After saving the Environment Variables in Vercel, you must **Redeploy** your project for them to take effect.
- Go to Vercel Dashboard > Deployments.
- Click the three dots on the latest deployment > **Redeploy**.

## Troubleshooting

- **500 Error**: Usually means `NEXTAUTH_SECRET` is missing.
- **Provider Error**: Usually means the Redirect URI in Google Console doesn't match `https://your-project-name.vercel.app/api/auth/callback/google`.
