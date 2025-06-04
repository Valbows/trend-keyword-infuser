# Trend Keyword Infuser MVP

This project is a Trend Keyword Infuser MVP designed to generate scripts or content by infusing trending keywords into a given topic. It features a Next.js frontend and a Node.js/Express backend.

## Project Structure

```
/Users/valrene/CascadeProjects/trend-keyword-infuser-mvp
├── .vscode/                # VS Code workspace settings & extension recommendations
├── backend/                # Node.js/Express backend application
│   ├── src/
│   ├── tests/
│   ├── .env.example
│   ├── .gitignore
│   ├── eslint.config.mjs
│   ├── package.json
│   └── ...
├── frontend/               # Next.js frontend application
│   ├── src/
│   ├── public/
│   ├── .gitignore
│   ├── eslint.config.mjs
│   ├── next.config.mjs
│   ├── package.json
│   ├── tailwind.config.ts
│   └── ...
├── .gitignore              # Root gitignore for OS/IDE specific files
├── package.json            # Root package.json for managing both workspaces
└── README.md               # This file
```

## Setup Instructions

1.  **Clone the repository (if applicable).**

2.  **Install Root Dependencies:**
    Navigate to the project root directory and install dependencies for the root `package.json` (which includes `npm-run-all` for managing workspace scripts).
    ```bash
    cd /Users/valrene/CascadeProjects/trend-keyword-infuser-mvp
    npm install
    ```

3.  **Install Frontend Dependencies:**
    Navigate to the `frontend` directory and install its dependencies.
    ```bash
    cd frontend
    npm install
    ```

4.  **Install Backend Dependencies:**
    Navigate to the `backend` directory and install its dependencies.
    ```bash
    cd ../backend  # or cd /Users/valrene/CascadeProjects/trend-keyword-infuser-mvp/backend
    npm install
    ```

5.  **Set up Backend Environment Variables:**
    *   In the `backend` directory, copy `.env.example` to a new file named `.env`.
        ```bash
        cp .env.example .env
        ```
    *   Fill in the required environment variables in the `.env` file (e.g., `PORT`, `GEMINI_API_KEY`).

## Available Scripts

All scripts can be run from the **project root directory** (`/Users/valrene/CascadeProjects/trend-keyword-infuser-mvp/`).

*   **Start Both Development Servers (Frontend & Backend Concurrently):**
    ```bash
    npm run dev
    ```
    *   Frontend will typically be available at `http://localhost:3000`.
    *   Backend will typically be available at `http://localhost:8000` (or as configured in `backend/.env`).

*   **Start Frontend Development Server Only:**
    ```bash
    npm run dev:frontend
    ```

*   **Start Backend Development Server Only:**
    ```bash
    npm run dev:backend
    ```

*   **Lint Both Frontend and Backend:**
    ```bash
    npm run lint
    ```

*   **Format Both Frontend and Backend:**
    ```bash
    npm run format
    ```

*   **Check Formatting for Both Frontend and Backend:**
    ```bash
    npm run check-format
    ```
    (This is useful for CI environments to ensure code is formatted correctly.)

*   **Run Backend Tests:**
    ```bash
    npm run test
    ```
    (Currently targets backend tests only.)

Individual scripts can also be run from within their respective `frontend` or `backend` directories.

## Technology Stack

*   **Frontend:**
    *   Next.js (v14+ with App Router)
    *   React
    *   TypeScript
    *   Tailwind CSS (v4)
    *   ESLint
    *   Prettier
*   **Backend:**
    *   Node.js
    *   Express.js
    *   ESLint (with CommonJS module support)
    *   Prettier
    *   Jest (for testing)
*   **Development & Tooling:**
    *   npm (for package management)
    *   `npm-run-all` (for concurrent script execution)
    *   VS Code (with recommended extensions for ESLint, Prettier, Tailwind CSS)

