# Contributing to Git Gud Manager

Thank you for your interest in contributing to Git Gud Manager! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct. By participating, you agree to uphold this code.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ with pgvector extension
- Git

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/git-gud-manager.git`
3. Install dependencies: `npm install`
4. Set up your development environment following the README.md
5. Create a feature branch: `git checkout -b feature/your-feature-name`

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Write meaningful commit messages following conventional commits format
- Add JSDoc comments for public functions

### Testing
- Write tests for new features
- Ensure all tests pass: `npm run test:all`
- Run type checking: `npm run typecheck`
- Run linting: `npm run lint`

### Pull Request Process
1. Update the README.md if you've made significant changes
2. Add tests for your changes
3. Ensure all CI checks pass
4. Request review from maintainers

## 🐛 Reporting Issues

- Use GitHub Issues for bug reports
- Include steps to reproduce
- Provide environment details
- Add relevant logs or screenshots

## 💡 Feature Requests

- Use GitHub Discussions for feature requests
- Explain the use case and benefits
- Discuss implementation approaches

## 📚 Documentation

- Update documentation for API changes
- Add JSDoc comments for new functions
- Update the README for significant changes

Thank you for contributing! 🎉
