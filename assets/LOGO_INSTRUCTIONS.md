# Al Ameen Stud Logo Setup Instructions

## Current Status
The app is currently using the default `icon.png` as a placeholder for the logo.

## How to Add Your Custom Logo

### Option 1: Replace the icon.png (Quick & Easy)
1. Save your Al Ameen Stud logo as `icon.png`
2. Replace the existing file at: `C:\Users\badar\IdeaProjects\AlAmeenStable\Al-Ameen-Stable\assets\icon.png`
3. The app will automatically use your logo everywhere

### Option 2: Add as a separate logo.png file (Recommended)
1. Save your Al Ameen Stud logo as `logo.png` in the assets folder:
   `C:\Users\badar\IdeaProjects\AlAmeenStable\Al-Ameen-Stable\assets\logo.png`

2. Update the following files to change `icon.png` to `logo.png`:
   - `src/screens/LoginScreen.js` (line ~80)
   - `src/screens/VisitorHomeScreen.js` (line ~18)
   - `src/screens/ClientHomeScreen.js` (line ~54)
   - `src/components/AdminTabs.js` (line ~60)

3. Simply change:
   ```javascript
   source={require('../../assets/icon.png')}
   ```
   to:
   ```javascript
   source={require('../../assets/logo.png')}
   ```

## Logo Placements in the App

Your logo now appears in 4 strategic locations:

1. **Login Screen** - Large centered logo (100x100px)
   - First impression for all users
   - Professional branding on entry

2. **Visitor Home Screen** - Header logo (120x40px)
   - Visible to public visitors
   - Horizontal format for better header fit

3. **Client Home Screen** - Subtle watermark (100x40px, 10% opacity)
   - Non-intrusive branding
   - Maintains focus on client information

4. **Admin Screens** - Header logo on all 6 admin tabs (80x30px)
   - Consistent branding across: Missions, Horses, Feeding, Lessons, Clients, Workers
   - Professional appearance for staff

## Image Recommendations

- **Format**: PNG with transparent background
- **Resolution**: At least 512x512px for best quality
- **Aspect Ratio**: The current code handles both square and horizontal logos
- **File Size**: Keep under 500KB for optimal performance

## Current Logo Design
Your Al Ameen Stud logo features:
- Elegant horse illustration in a laurel wreath
- Gold and white color scheme
- "AL AMEIN STUD" text on decorative ribbon
- "AS" monogram at top

This professional design perfectly matches your app's dark theme with blue accents!

