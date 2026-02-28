# 🤝 Contributing to WorkSphere AI

Thank you for your interest in contributing to WorkSphere AI! We welcome contributions from developers, designers, and anyone passionate about transforming work communication in Africa.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Git
- A Supabase account (for backend development)
- A Cloudinary account (for media handling)

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/worksphereai.git
   cd worksphereai
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your credentials
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Follow the existing code style and patterns
- Write clean, commented code
- Update documentation as needed
- Test your changes thoroughly

### 3. Run Tests and Linting

```bash
# Frontend
cd frontend
npm run lint
npm run test
npm run type-check

# Backend
cd backend
npm run lint
npm run test
```

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add user authentication with Google OAuth

- Implement Google OAuth integration
- Add user profile management
- Update authentication UI components
- Add error handling for auth failures

Closes #123"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:

- Clear title and description
- Reference any related issues
- Screenshots for UI changes
- Testing instructions

## 🏗️ Project Structure

```
worksphere-ai/
├── frontend/                 # React web application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/        # Basic UI components
│   │   │   ├── forms/     # Form components
│   │   │   └── layout/    # Layout components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── types/          # TypeScript definitions
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── tests/              # Test files
├── backend/                 # Supabase Edge Functions
│   └── functions/          # Serverless functions
│       ├── auth/           # Authentication functions
│       ├── ai/             # AI-related functions
│       └── utils/          # Utility functions
├── database/                # Database schemas and migrations
│   ├── schemas/            # Table definitions
│   ├── migrations/        # Database migrations
│   └── seeds/             # Initial data
└── docs/                   # Documentation
```

## 🎨 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Prefer explicit types over implicit any
- Use interfaces for object shapes
- Follow ESLint configuration

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

const createUser = async (userData: User): Promise<User> => {
  // Implementation
};

// Bad
const createUser = async (userData: any) => {
  // Implementation
};
```

### React Components

- Use functional components with hooks
- Follow React naming conventions
- Use TypeScript interfaces for props
- Keep components focused and reusable

```typescript
// Good
interface ButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'secondary';
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, variant, onClick }) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### CSS/Styling

- Use TailwindCSS classes
- Follow mobile-first responsive design
- Use semantic HTML elements
- Maintain consistent spacing and colors

### Database

- Use descriptive table and column names
- Include proper constraints and indexes
- Write migration files for schema changes
- Use proper foreign key relationships

## 🧪 Testing

### Frontend Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Backend Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### Testing Guidelines

- Write unit tests for utility functions
- Test React components with user interactions
- Mock external dependencies
- Aim for >80% code coverage

## 📝 Documentation

### Code Documentation

- Use JSDoc comments for functions
- Document complex logic
- Explain algorithm approaches
- Include usage examples

```typescript
/**
 * Creates a new user in the database
 * @param userData - User information to create
 * @returns Promise resolving to the created user
 * @throws Error if user creation fails
 */
const createUser = async (userData: User): Promise<User> => {
  // Implementation
};
```

### README Updates

- Update feature lists
- Add new environment variables
- Update setup instructions
- Include new dependencies

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Info**
   - OS and version
   - Node.js version
   - Browser version (if applicable)

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Screenshots if relevant

3. **Additional Context**
   - Error messages
   - Console logs
   - Related issues

## 💡 Feature Requests

When requesting features:

1. **Use Case**
   - Describe the problem you're solving
   - Who benefits from this feature
   - Why it's important

2. **Proposed Solution**
   - Detailed description
   - Mockups or wireframes (if UI)
   - Technical considerations

3. **Alternatives**
   - Other approaches considered
   - Why this approach is preferred

## 🏷️ Issue Labels

- `bug`: Bug reports
- `enhancement`: Feature requests
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Community help needed
- `priority/high`: High priority issues
- `priority/medium`: Medium priority issues
- `priority/low`: Low priority issues

## 🚀 Release Process

1. **Version Bump**
   - Update version numbers in package.json files
   - Update CHANGELOG.md

2. **Testing**
   - Run full test suite
   - Manual testing of critical features
   - Performance testing

3. **Deployment**
   - Deploy to staging first
   - Run integration tests
   - Deploy to production

## 🎯 Areas Where We Need Help

### Frontend
- UI/UX improvements
- Mobile responsiveness
- Performance optimization
- Accessibility improvements

### Backend
- API optimization
- Security enhancements
- Performance monitoring
- Error handling improvements

### Documentation
- API documentation
- User guides
- Developer tutorials
- Translation to local languages

### Testing
- Test coverage improvements
- Automated testing
- Performance testing
- Security testing

## 📞 Getting Help

- **Discord**: [Join our community](https://discord.gg/worksphere)
- **Email**: dev@worksphere.ai
- **GitHub Issues**: [Create an issue](https://github.com/WorksphereAI/worksphereai/issues)
- **Documentation**: [Read our docs](https://docs.worksphere.ai)

## 🙏 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and considerate
- Use inclusive language
- Focus on constructive feedback
- Help others learn and grow

## 📄 License

By contributing to WorkSphere AI, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to WorkSphere AI!** 🌍✨

Together, we're building the future of intelligent work communication in Africa.
