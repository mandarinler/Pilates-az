# Cloudinary Setup Instructions

## Step 1: Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up For Free"
3. Complete the registration

## Step 2: Get Your Credentials

1. After signing up, you'll be taken to your dashboard
2. Copy your credentials from the dashboard:
   - **Cloud Name** dvppsykcl 
   - **API Key** 648435193157952
   - **API Secret** CbYhHeRIZF-Zj0StW-MJprWzgQg

## Step 3: Create Environment File

Create a `.env` file in the `server` folder with the following content:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Replace the values with your actual Cloudinary credentials.

## Step 4: Start the Server

Run your server:
```bash
npm start
```

## Benefits of Cloudinary

- ✅ No more local file storage issues
- ✅ Automatic image optimization
- ✅ CDN delivery for fast loading
- ✅ Image transformations on-the-fly
- ✅ Free tier: 25 GB storage + 25 GB bandwidth

## Important Notes

- Don't commit the `.env` file to git (it's already in .gitignore)
- The old `uploads` folder can be deleted after verifying everything works
- Images will be stored in a folder called "pilates-uploads" in your Cloudinary account

