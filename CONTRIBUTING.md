# Contributing to Breaktool

Thank you for your interest in contributing to Breaktool! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- **Bun** (recommended) or **Node.js 18+**
- **Git**
- **Supabase account** (free tier available)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/breaktool.git
   cd breaktool
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   ```bash
   cp ENVIRONMENT .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Database Setup**
   ```bash
   bun run db:generate
   bun run db:push
   ```

5. **Start Development Server**
   ```bash
   bun run dev
   ```

## 📋 Development Guidelines

### Code Style
- Use **TypeScript** for all new code
- Follow **ESLint** rules and fix any warnings
- Use **Tailwind CSS** for styling
- Follow existing code patterns and structure

### Commit Messages
Use conventional commit format:
```
type(scope): description

Examples:
feat(auth): add role-based access control
fix(api): resolve database connection issue
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, well-documented code
   - Add tests if applicable
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   bun run type-check
   bun run lint
   bun run build
   ```

4. **Submit Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes by role
│   ├── (tools)/           # Tool-related routes
│   └── api/               # API endpoints
├── components/             # Reusable components
│   ├── ui/                # Shadcn/ui components
│   ├── reviews/           # Review components
│   ├── community/         # Community components
│   └── seo/               # SEO components
├── lib/                    # Utilities and services
│   ├── services/          # Business logic services
│   ├── cache/             # Caching utilities
│   └── auth/              # Authentication utilities
├── types/                  # TypeScript definitions
└── utils/                  # Helper functions
```

## 🧪 Testing

### Running Tests
```bash
# Type checking
bun run type-check

# Linting
bun run lint

# Build test
bun run build

# Bundle analysis
bun run analyze
```

### Testing Guidelines
- Test all new features locally
- Ensure all TypeScript errors are resolved
- Verify responsive design on different screen sizes
- Test API endpoints with proper error handling

## 📚 Documentation

### Updating Documentation
- Update relevant documentation files in `docs/` folder
- Keep README.md current with new features
- Document API changes in `docs/API_STRUCTURE.md`
- Update performance notes in `docs/PERFORMANCE_OPTIMIZATION.md`

### Code Documentation
- Add JSDoc comments for complex functions
- Document API endpoints with examples
- Include inline comments for complex logic

## 🐛 Bug Reports

When reporting bugs, please include:
- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, browser, Node.js version
- **Screenshots**: If applicable

## ✨ Feature Requests

When requesting features:
- **Use Case**: Describe the problem you're trying to solve
- **Proposed Solution**: Your suggested approach
- **Alternatives**: Other solutions you've considered
- **Additional Context**: Any other relevant information

## 🔒 Security

If you discover a security vulnerability:
- **DO NOT** create a public issue
- Email security concerns to: security@breaktool.com
- Include detailed information about the vulnerability
- Allow time for the issue to be addressed before disclosure

## 📝 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community

### Unacceptable Behavior
- Harassment, trolling, or inflammatory comments
- Personal attacks or political discussions
- Spam or excessive self-promotion
- Any other unprofessional conduct

## 🎯 Areas for Contribution

### High Priority
- **Performance Optimization**: Bundle size, loading times
- **SEO Improvements**: Meta tags, structured data
- **Accessibility**: ARIA labels, keyboard navigation
- **Testing**: Unit tests, integration tests

### Medium Priority
- **UI/UX Improvements**: Better user experience
- **API Enhancements**: New endpoints, better error handling
- **Documentation**: Code comments, API docs
- **Mobile Optimization**: Responsive design improvements

### Low Priority
- **New Features**: Additional functionality
- **Code Refactoring**: Clean up existing code
- **Dependencies**: Update packages, remove unused ones

## 🤝 Getting Help

- **Documentation**: Check the `docs/` folder
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Join our community channels

## 📄 License

By contributing to Breaktool, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Breaktool! 🚀
