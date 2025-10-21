# Cloudinary Setup Instructions

## Configuration Details
Your Cloudinary account has been configured in the app with the following credentials:

- **Cloud Name:** dtbynupyx
- **API Key:** 696232838498944
- **API Secret:** K-4f9U5kLBu0UOLP_VlRKW23brU

## Important: Create Upload Preset

To enable image uploads, you need to create an **unsigned upload preset** in your Cloudinary dashboard:

### Steps:

1. **Log in to Cloudinary Dashboard**
   - Go to: https://cloudinary.com/console
   - Log in with your account

2. **Navigate to Upload Settings**
   - Click on the **Settings** icon (gear icon) in the top right
   - Select **Upload** from the left sidebar

3. **Create Upload Preset**
   - Scroll down to **Upload presets** section
   - Click **Add upload preset**

4. **Configure the Preset**
   - **Preset name:** `al-ameen-stable`
   - **Signing Mode:** Select **Unsigned** (important!)
   - **Folder:** Leave empty (the app will specify folders dynamically)
   - **Access Mode:** Upload
   - Click **Save**

5. **Verify Setup**
   - The preset name should be: `al-ameen-stable`
   - Make sure it's set to **Unsigned** mode

## Features Implemented

### 1. Horse Images
- Add images when creating new horses
- Images are uploaded to Cloudinary in the `horses` folder
- Optimized image delivery for better performance
- Images displayed in horse details view

### 2. Announcement Images
- Add images to announcements
- Images uploaded to Cloudinary in the `announcements` folder
- Optimized thumbnails in feed view
- Full-size images in detail modal

### 3. Image Optimization
- Automatic image resizing and optimization
- WebP format for better performance
- Quality optimization to reduce bandwidth

## Folder Structure in Cloudinary

Images are organized in the following folders:
- `horses/` - Horse profile images
- `announcements/` - Announcement images

## Troubleshooting

### Upload Fails with "Invalid upload preset"
- Make sure you created the preset named exactly: `al-ameen-stable`
- Verify it's set to **Unsigned** mode

### Images Not Displaying
- Check your internet connection
- Verify the Cloudinary cloud name is correct
- Check browser/app console for errors

### Slow Upload Times
- Large images may take time to upload
- The app compresses images to 80% quality before upload
- Consider using smaller image sizes (recommended: under 2MB)

## Security Note

For production apps, it's recommended to:
1. Move API secrets to environment variables
2. Implement backend upload endpoints for signed uploads
3. Add upload restrictions (file size, format, etc.)
4. Enable automatic moderation if needed

## Support

For Cloudinary-specific issues, visit:
- Documentation: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com

