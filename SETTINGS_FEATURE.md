# Settings Configuration Feature

## Overview
Comprehensive settings page has been created where you can configure stock thresholds and other system preferences.

## What's New

### 1. **Configurable Stock Thresholds** 
You can now customize when products show different status badges:

- **Critical Stock Threshold** (Default: 5 units)
  - Products at or below this show "Out of Stock" red badge
  
- **Low Stock Threshold** (Default: 15 units)
  - Products at or below this show "Low Stock" red badge
  
- **Medium Stock Threshold** (Default: 30 units)
  - Products at or below this show "Medium Stock" yellow badge
  
- **High Stock** (Above medium threshold)
  - Products above this show "In Stock" green badge

### 2. **Live Badge Preview**
The settings page includes a real-time preview showing how your badge thresholds will look with current values.

### 3. **Business Settings**
Configure:
- Business Type (Retail, Restaurant, Small Shop)
- Business Name
- Currency (USD, EUR, GBP, CAD)
- Default Tax Rate (%)

### 4. **AI & Receipt Settings**
Toggle settings for:
- AI suggestions
- Automatic receipt printing
- Email receipts

## How to Use

1. **Access Settings**
   - Click "Settings" in the navigation bar on the dashboard
   - Or navigate to `http://localhost:3000/settings`

2. **Configure Stock Thresholds**
   - Enter your preferred numbers for each threshold level
   - See the badge preview update in real-time
   - Click "Save All Settings" to apply changes

3. **View Updated Badges**
   - Go to Inventory page (`/inventory`)
   - All product badges now use your custom thresholds
   - Filter by "Low Stock" to see items below your threshold

## Technical Implementation

### Files Modified/Created:

1. **`lib/settings.ts`** (NEW)
   - Helper functions for loading/saving settings
   - Default values for stock and business settings
   - Type-safe interfaces for all settings

2. **`app/settings/page.tsx`** (ENHANCED)
   - Stock threshold configuration UI
   - Live badge preview
   - Business settings form
   - Save functionality with toast notifications

3. **`app/inventory/page.tsx`** (UPDATED)
   - Now reads stock thresholds from settings
   - Dynamic badge colors based on configured thresholds
   - Uses new `getStockStatus()` function

### Settings Storage
- All settings stored in browser's localStorage
- Persists across sessions
- Falls back to defaults if no saved settings exist
- Type-safe with TypeScript interfaces

## Default Values

```typescript
Stock Settings:
- criticalStockThreshold: 5
- lowStockThreshold: 15
- mediumStockThreshold: 30

Business Settings:
- businessName: 'My Store'
- businessType: 'retail'
- currency: 'USD'
- taxRate: 10
```

## Testing

Your current database has:
- **37 low stock items** (stock < 15 units)
- Items like:
  - Battery Case - 2x 20700/21700: 3 units
  - Battery 26650 IJOY: 8 units
  - Ceramic Tweezers: 1 unit
  - it's tough: 0 units (OUT OF STOCK)

These will all show as low stock with default settings.

## Future Enhancements

Potential additions:
- Email alerts when stock hits thresholds
- Different thresholds per category
- Automatic reorder when critical threshold hit
- Export/import settings as JSON
- Database storage instead of localStorage
