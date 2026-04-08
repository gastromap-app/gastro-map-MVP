# Entities Layer

This layer contains business entities that represent core domain objects of the application.

## Structure

Each entity should have its own folder with the following structure:

```
entity-name/
├── index.js          # Public API
├── model/            # State management (Zustand stores, etc.)
├── ui/               # UI components specific to this entity
└── lib/              # Helper functions, constants, types
```

## Example Entities

- `User` - User account and profile data
- `Restaurant` - Restaurant information
- `Review` - User reviews and ratings
- `Location` - Geographic locations
- `Payment` - Payment transactions
- `Subscription` - User subscriptions

## Guidelines

1. Entities should be independent of features
2. Each entity exports only what's needed via `index.js`
3. Use TypeScript types/interfaces for entity shapes
4. Keep business logic in `model/` or `lib/`
5. UI components should be reusable across features
