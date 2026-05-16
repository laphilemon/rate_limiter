# Contributing to Rate Limiter Service

Thank you for your interest in improving the Rate Limiter Service! We welcome contributions from everyone.

## How to Contribute

### 1. Report Bugs
If you find a bug, please open an issue describing the problem, including steps to reproduce and your environment details.

### 2. Suggest Enhancements
Have an idea for a new feature? Open an issue to discuss it before starting work.

### 3. Pull Requests
1. **Fork** the repository.
2. **Create a branch** for your feature or fix: `git checkout -b feature/your-feature-name`.
3. **Implement your changes** and ensure you follow the existing code style.
4. **Write tests** for your changes in the `tests/` directory.
5. **Run tests** to ensure everything is working: `npm test`.
6. **Commit** your changes with descriptive messages.
7. **Push** to your fork and submit a **Pull Request**.

## Development Guidelines

- **TypeScript**: Ensure all new code is properly typed.
- **Documentation**: Update the `README.md` or relevant files if you change infrastructure or configuration requirements.
- **Messaging**: When adding new RabbitMQ exchanges or queues, update `src/config/rabbitmq.ts`.
- **Redis**: Any changes to the rate-limiting logic should be reflected in the Lua scripts in `src/scripts`.

## Code of Conduct
Please be respectful and professional in all interactions within this project.

## Questions?
If you have any questions about the codebase, feel free to open an issue or contact the maintainers.