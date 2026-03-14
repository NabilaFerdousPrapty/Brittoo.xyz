# 📱 Brittoo - Own less ,Access More

A modern peer-to-peer rental platform built with React Native (Expo) that enables users to rent items from each other using cash or a unique credit system.

## 📸 App Preview

```
[Placeholder for app screenshots/video]
```

## 🏗️ Project Structure

```
brittoo/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Home/Dashboard
│   │   ├── browse.tsx         # Browse Items
│   │   ├── add-item.tsx       # List New Item
│   │   └── profile.tsx        # User Profile
│   └── how-it-works.tsx
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── AuthModal.tsx
│   └── features/
│       └── FeatureCard.tsx
├── store/
│   └── useAuthStore.ts
├── types/
│   └── product.types.ts
└── assets/
    └── images/
        └── brittoo-logo.png
```

## 🎯 Tabs Overview

### 1. **Home Tab** (`index.tsx`)

The main dashboard showing personalized content.

```
[Placeholder for Home Tab Screenshot]
```

**Features:**

- **Hero Section**: Welcome message with user's name
- **Quick Stats**: Platform metrics (items rented, listed, reviews)
- **Featured Categories**: Scrollable category cards
- **Recent Listings**: Horizontal carousel of nearby items
- **How It Works**: Quick guide preview
- **Promotional Banners**: Special offers and announcements

**Key Components:**

```tsx
- CategoryCard: Visual category navigation
- ItemCard: Compact item preview with price/credit
- StatsOverview: User activity summary
- PromoBanner: Gradient promotional cards
```

### 2. **Browse Tab** (`browse.tsx`)

Discover and search for items to rent.

```
[Placeholder for Browse Tab Screenshot]
```

**Features:**

- **Search Bar**: Real-time search with filters
- **Category Filters**: Quick filter chips
- **Sort Options**: Price, distance, rating, newest
- **Item Grid**: Masonry layout of available items
- **Map View**: Toggle between grid and map
- **Filters Modal**: Advanced filtering options

**Key Components:**

```tsx
- SearchInput: Debounced search with suggestions
- FilterChips: Interactive category filters
- ItemGrid: Responsive grid layout
- MapView: Location-based item browsing
- PriceFilter: Slider for price/credit range
```

### 3. **Add Item Tab** (`add-item.tsx`)

List new items for rent.

```
[Placeholder for Add Item Tab Screenshot]
```

**Features:**

- **Multi-step Form**: Guided listing process
- **Image Upload**: Multiple photos with preview
- **Category Selection**: Hierarchical categories
- **Pricing Options**: Cash deposit and/or credits
- **Availability Calendar**: Date picker for availability
- **Condition Assessment**: Visual condition indicators

**Form Steps:**

```tsx
Step 1: Basic Info (Title, Description, Category)
Step 2: Photos (Upload up to 10 images)
Step 3: Pricing (Cash deposit, Credit value)
Step 4: Availability (Dates, Location)
Step 5: Review & Publish
```

### 4. **Profile Tab** (`profile.tsx`)

User profile and account management.

```
[Placeholder for Profile Tab Screenshot]
```

**Features:**

- **Profile Header**: Avatar, name, rating, member since
- **Stats Cards**: Items rented, listed, reviews
- **Quick Actions**: My Listings, Bookings, Favorites
- **Trust Level**: Progress bar with benefits
- **Credit Balance**: Earned credits overview
- **Settings Menu**: Account preferences
- **Support Section**: Help and contact options

**Menu Items:**

```tsx
- My Listings: Manage listed items
- My Bookings: View rental history
- Favorites: Saved items
- Reviews: Given and received reviews
- Settings: Account preferences
- Support: Help center & contact
```

## 📱 Tab Navigation Layout (`_layout.tsx`)

```tsx
// Tab bar configuration
- Home (index) → Icon: home-outline
- Browse → Icon: search-outline
- Add Item → Icon: add-circle (center button)
- Profile → Icon: person-outline
```

```
[Placeholder for Tab Navigation Screenshot]
```

**Features:**

- Custom center button for "Add Item"
- Animated tab transitions
- Badge notifications
- Authentication protection for certain tabs

## ✨ Completed Features

### ✅ **Authentication System**

- [x] Login screen with email/password
- [x] Signup with form validation
- [x] Terms & conditions checkbox
- [x] Password visibility toggle
- [x] Auth store with Zustand
- [x] Protected routes

### ✅ **UI Components**

- [x] Custom Button (variants: primary, secondary, danger)
- [x] Input fields with icons and validation
- [x] Auth Modal for unauthenticated users
- [x] Feature Card (5 variants)
  - Default
  - Compact
  - Horizontal
  - Gradient
  - Stats
- [x] Step indicators for guides
- [x] Expandable FAQ items
- [x] Gradient backgrounds
- [x] Responsive layouts

### ✅ **Screens Completed**

#### **Authentication**

- [x] Login screen with error handling
- [x] Signup with validation
- [x] Forgot password placeholder

#### **Information**

- [x] How It Works screen with:
  - Renting steps guide
  - Listing steps guide
  - Credit system explained
  - FAQ section with expandable items
  - WhatsApp support link

#### **Profile**

- [x] User profile display
- [x] Stats cards
- [x] Quick actions grid
- [x] Settings menu
- [x] Logout functionality
- [x] Auth protection

### ✅ **State Management**

- [x] Zustand store setup
- [x] Authentication state
- [x] Loading states
- [x] Error handling

### ✅ **Styling**

- [x] TailwindCSS (NativeWind) integration
- [x] Consistent color scheme
- [x] Gradient implementations
- [x] Shadow and elevation
- [x] Responsive design

## 🎨 Design System

### **Color Palette**

```tsx
Primary: {
  50: '#f0fdf4',
  100: '#dcfce7',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
}

Accent Colors:
- Blue: '#3B82F6' (Browse, Info)
- Purple: '#8B5CF6' (Premium, Trust)
- Pink: '#EC4899' (Favorites, Actions)
- Amber: '#F59E0B' (Warnings, Ratings)
- Indigo: '#6366F1' (Verification)
```

### **Typography**

```tsx
Headings: font-bold, text-2xl/3xl
Subheadings: font-semibold, text-lg/xl
Body: text-gray-600, text-sm/base
Captions: text-gray-400, text-xs
```

### **Spacing**

- Consistent padding: 4, 6, 8 (px/py)
- Card padding: p-4 to p-6
- Section spacing: mt-6 to mt-8
- Grid gaps: gap-4

## 🚀 Upcoming Features

### 🔜 **Browse & Search**

- [ ] Real search functionality
- [ ] Filter system
- [ ] Map integration
- [ ] Category browsing

### 🔜 **Item Management**

- [ ] Create listing functionality
- [ ] Image upload
- [ ] Availability calendar
- [ ] Edit/delete listings

### 🔜 **Booking System**

- [ ] Rental requests
- [ ] Booking calendar
- [ ] Payment processing
- [ ] Review system

### 🔜 **Credit System**

- [ ] Credit balance tracking
- [ ] Earn/spend logic
- [ ] Transaction history
- [ ] Trust level progression

### 🔜 **Messaging**

- [ ] In-app chat
- [ ] Notifications
- [ ] Rental coordination

### 🔜 **Admin Panel**

- [ ] Listing verification
- [ ] Dispute resolution
- [ ] User management

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based)
- **Styling**: NativeWind (TailwindCSS)
- **State Management**: Zustand
- **Icons**: @expo/vector-icons (Ionicons)
- **Animations**: React Native Animated
- **Gradients**: expo-linear-gradient
- **Type Safety**: TypeScript

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/NabilaFerdousPrapty/Brittoo.xyz.git

# Install dependencies
cd brittoo
npm install

# Start the app
npx expo start
```

## 📱 Running on Devices

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web

# QR Code for Expo Go
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📞 Contact & Support

- **WhatsApp**: https://wa.link/2fcbvl
- **Email**:durjoy6812@gmail.com
- **Website**: https://brittoo.xyz

---

```
[Placeholder for App Demo Video/GIF]
```

**Version**: 1.0.0 (Beta)  
**Last Updated**: March 2026
**Status**: Active Development 🚧
