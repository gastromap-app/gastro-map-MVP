# Widgets Layer

This layer contains complex UI components that combine multiple features and entities to form complete blocks of the application.

## Structure

Each widget should have its own folder with the following structure:

```
widget-name/
├── index.js          # Public API
├── ui/               # Widget-specific UI components
└── lib/              # Helper functions, constants
```

## Example Widgets

- `Header` - Navigation header with auth status
- `Footer` - Application footer with links
- `RestaurantCard` - Complete restaurant card with actions
- `ReviewList` - List of reviews with pagination
- `MapWithMarkers` - Interactive map component
- `PaymentForm` - Complete payment form widget
- `UserProfile` - User profile widget

## Guidelines

1. Widgets combine entities and features
2. Each widget exports only what's needed via `index.js`
3. Widgets can be used across different pages
4. Keep widgets independent and reusable
5. Use composition to build complex widgets from simpler ones

## Difference from Features

- **Features**: Single user interaction or business logic (e.g., "add to favorites")
- **Widgets**: Complete UI blocks that may use multiple features (e.g., "restaurant card" with favorite button, rating, info)
