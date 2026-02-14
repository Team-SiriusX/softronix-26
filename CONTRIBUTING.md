# Contributing to Softronix-26

We're thrilled you're interested in contributing to Softronix-26! We love collaboration and appreciate your help.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an Issue describing:
1. What happened
2. What you expected to happen
3. Steps to reproduce
4. Screenshots (if applicable)

### Feature Requests

Have an idea? Open an Issue and tag it as `enhancement`. Describe the feature and why it would be valuable.

### Pull Requests

1.  **Fork the repo** and create your branch from `main`.
2.  **Clone** your fork locally.
3.  **Install dependencies**:
    ```bash
    pnpm install
    ```
4.  **Create a new branch**:
    ```bash
    git checkout -b my-new-feature
    ```
5.  **Make your changes**.
6.  **Test your changes**: verify via `pnpm dev` that everything works.
7.  **Commit your changes**:
    ```bash
    git commit -m "Add some feature"
    ```
8.  **Push to your fork**:
    ```bash
    git push origin my-new-feature
    ```
9.  **Open a Pull Request** on the original `softronix-26` repo.

## Code Style

- We use **Prettier** for formatting.
- Components are in `src/components/`.
- Backend logic uses **Hono** in `src/app/api/`.
- State management uses **Zustand**.

## License

By contributing, you agree that your contributions will be licensed under the MIT License used by this project.
