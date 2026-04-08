# Contributing to GastroMap

Thank you for your interest in contributing to GastroMap! This document provides guidelines and instructions for contributing.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials
4. Start development server: `npm run dev`

## Project Structure

This project follows Feature-Sliced Design (FSD) architecture:

- `/src/app` - Application initialization, providers, routing
- `/src/pages` - Page components
- `/src/widgets` - Complex UI blocks combining features
- `/src/features` - User interactions and business logic
- `/src/entities` - Business entities (User, Restaurant, etc.)
- `/src/shared` - Reusable code (UI kit, API, utils)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## Code Style

- Use ESLint and Prettier for consistent code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass
4. Submit a pull request with a clear description

## Questions?

Open an issue for any questions or suggestions.
