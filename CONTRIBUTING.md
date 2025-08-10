# Contributing to AI Education Platform 🤝

Thank you for your interest in contributing to the AI Education Platform! This guide will help you get started with contributing to our mission of empowering Indian educators with world-class AI tools.

## Code of Conduct

By participating in this project, you agree to uphold our Code of Conduct:

- **Be respectful** and inclusive of all contributors regardless of experience level
- **Be constructive** in feedback and discussions
- **Focus on education** - remember our mission to help teachers and students
- **Maintain quality** - follow coding standards and best practices
- **Protect privacy** - never commit sensitive data or real student information

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Docker (optional, for full local development)
- Basic knowledge of TypeScript, React, and microservices architecture

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/your-username/ai-education-platform.git
cd ai-education-platform
```

2. **Install Dependencies**
```bash
npm run install:all
```

3. **Set Up Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run Tests**
```bash
npm run test
```

5. **Start Development Server**
```bash
npm run dev
```

## Development Workflow

### Branch Strategy

We use **Git Flow** with the following branches:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development
- `hotfix/*` - Critical production fixes
- `release/*` - Release preparation

### Creating a Feature

1. **Create Feature Branch**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

2. **Development Process**
```bash
# Make your changes
git add .
git commit -m "feat(component): add new functionality"
git push origin feature/your-feature-name
```

3. **Pull Request**
- Create PR from your feature branch to `develop`
- Fill out the PR template completely
- Ensure all checks pass
- Request review from appropriate team members

### Commit Message Convention

We use **Conventional Commits** format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Build process or auxiliary tool changes
- `perf` - Performance improvements
- `ci` - CI/CD changes

**Examples:**
```bash
feat(auth): add JWT token refresh mechanism
fix(ai): resolve OpenAI API rate limiting issue
docs: update contribution guidelines
test(user): add unit tests for user registration
chore(deps): update TypeScript to v5.2.0
```

## Code Standards

### TypeScript Guidelines

- Use **strict TypeScript** configuration
- Define explicit return types for public methods
- Use **interfaces** over `any` type
- Follow **object-oriented principles** (SOLID)
- Use **Result pattern** for error handling instead of exceptions

**Example:**
```typescript
interface IUserService {
  createUser(data: CreateUserRequest): Promise<Result<User>>;
}

export class UserService implements IUserService {
  async createUser(data: CreateUserRequest): Promise<Result<User>> {
    try {
      const user = new User(data);
      const saveResult = await this.userRepository.save(user);
      return saveResult;
    } catch (error) {
      return Result.failure('Failed to create user');
    }
  }
}
```

### Architecture Guidelines

- **Microservices**: Each service should have single responsibility
- **Dependency Injection**: Use constructor injection for dependencies
- **Repository Pattern**: Abstract data access through repositories
- **Service Layer**: Keep business logic in service classes
- **Factory Pattern**: Use factories for complex object creation

### Testing Requirements

- **Unit Tests**: All services and utilities must have unit tests
- **Integration Tests**: Test service interactions
- **Coverage**: Maintain 90%+ test coverage
- **Test Structure**: Use AAA pattern (Arrange, Act, Assert)

**Example:**
```typescript
describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    authService = new AuthService(mockUserRepository, 'secret', 'refresh-secret');
  });

  describe('login', () => {
    it('should return success result for valid credentials', async () => {
      // Arrange
      const loginRequest = { email: 'test@example.com', password: 'password123' };
      mockUserRepository.findByEmail.mockResolvedValue(Result.success(mockUser));

      // Act
      const result = await authService.login(loginRequest);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.data.user.email).toBe(loginRequest.email);
    });
  });
});
```

## Project Structure

### Adding New Features

When adding new features, follow this structure:

```
services/your-service/
├── src/
│   ├── controllers/        # HTTP request handlers
│   ├── services/          # Business logic
│   ├── repositories/      # Data access
│   ├── models/           # Domain entities
│   ├── interfaces/       # Service contracts
│   ├── middlewares/      # Request middlewares
│   └── utils/            # Utility functions
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
└── package.json
```

### Shared Libraries

When adding to shared libraries:

```
shared/library-name/
├── src/
│   ├── interfaces/       # Shared interfaces
│   ├── types/           # Type definitions
│   ├── utils/           # Utility functions
│   ├── base/            # Base classes
│   └── constants/       # Constants and enums
├── tests/
└── package.json
```

## Educational Context

### Indian Education Standards

When working on educational features:

- **Curriculum Alignment**: Support NCERT, CBSE, ICSE, and state boards
- **Language Support**: Implement multi-language functionality
- **Cultural Sensitivity**: Ensure content is appropriate for Indian context
- **Age Appropriateness**: Follow Indian education age guidelines

### AI Content Guidelines

When implementing AI features:

- **Safety First**: Always implement content filtering
- **Teacher Control**: Teachers should have oversight of all AI interactions
- **Educational Value**: Ensure AI outputs align with learning objectives
- **Bias Prevention**: Implement measures to prevent cultural or gender bias

## Specific Contribution Areas

### 1. Teacher Tools Development

**Skills Needed:** TypeScript, React, Educational knowledge
**Focus Areas:**
- Lesson plan generation
- Assessment creation
- Content formatting
- Curriculum alignment

### 2. Student Tools Development

**Skills Needed:** TypeScript, React, Child safety knowledge
**Focus Areas:**
- Interactive learning tools
- Safety mechanisms
- Progress tracking
- Gamification

### 3. AI Integration

**Skills Needed:** LLM APIs, Prompt engineering, AI safety
**Focus Areas:**
- LLM provider integrations
- Prompt template creation
- Content moderation
- Performance optimization

### 4. Infrastructure & DevOps

**Skills Needed:** Docker, Kubernetes, CI/CD
**Focus Areas:**
- Deployment automation
- Monitoring and observability
- Security hardening
- Performance optimization

## Review Process

### Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows TypeScript strict mode
- [ ] All tests pass (`npm run test`)
- [ ] Code coverage meets requirements
- [ ] ESLint passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced
- [ ] Educational context is appropriate
- [ ] Breaking changes are documented

### Review Criteria

Reviewers will check:

1. **Code Quality**: Follows architecture guidelines and best practices
2. **Functionality**: Features work as intended with edge cases handled
3. **Tests**: Comprehensive test coverage with meaningful test cases
4. **Security**: No security vulnerabilities or data exposure
5. **Performance**: Code is optimized for scale
6. **Documentation**: Code is well-documented and README is updated
7. **Educational Value**: Features serve the educational mission

## Recognition

### Contributors

All contributors will be recognized in:
- `CONTRIBUTORS.md` file
- Release notes for significant contributions
- Annual contributor appreciation

### Types of Contributions

We value all types of contributions:

- **Code**: New features, bug fixes, improvements
- **Documentation**: README updates, API docs, tutorials
- **Testing**: Test cases, QA, bug reports
- **Design**: UI/UX improvements, design systems
- **Education**: Curriculum expertise, teaching insights
- **Localization**: Translation and cultural adaptation

## Getting Help

### Communication Channels

- **GitHub Discussions**: For feature discussions and Q&A
- **Issues**: For bug reports and feature requests
- **PR Comments**: For code-specific discussions
- **Email**: [maintainer-email] for sensitive issues

### Mentorship

New contributors can request mentorship:

1. Comment on a "good first issue"
2. Mention you're new and need guidance
3. A maintainer will assign themselves as mentor
4. Regular check-ins and code review support

### Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Indian Education System Overview](link-to-resource)

## Questions?

Don't hesitate to ask questions:

- Create a GitHub Discussion for general questions
- Comment on relevant issues for specific questions
- Reach out to maintainers for guidance

Thank you for contributing to the future of education in India! 🎓✨