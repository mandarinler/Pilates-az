# Cloudinary Direct Upload Setup

## Step 1: Create Unsigned Upload Preset

1. Go to your [Cloudinary Dashboard](https://cloudinary.com/console)
2. Click on **Settings** (gear icon in top right)
3. Go to **Upload** tab
4. Scroll down to **Upload presets** section
5. Click **Add upload preset**
6. Configure the preset:
   - **Preset name**: `pilates_uploads` (exactly this name)
   - **Signing mode**: Select **Unsigned** (important!)
   - **Folder**: `pilates-uploads`
7. Click **Save**

## Step 2: Test the Upload

The upload should now work from your admin panel! No server needed.

## Important Notes

- ✅ **No backend server required** - uploads go directly from browser to Cloudinary
- ✅ **Works on Vercel automatically** - no environment variables needed
- ✅ **Free tier**: 25 GB storage + 25 GB bandwidth/month
- ✅ Your Cloudinary credentials are already configured in the code

## How It Works

1. User selects an image in admin panel
2. Image is uploaded directly to Cloudinary (bypassing any server)
3. Cloudinary returns a URL
4. The URL is saved to your Firestore database

This is simpler, faster, and cheaper than running a separate server!

## Troubleshooting

If upload fails:
- Make sure the preset name is exactly `pilates_uploads`
- Make sure the preset is set to **Unsigned**
- Check browser console for errors
- Verify your Cloudinary cloud name is correct: `dvppsykcl`


