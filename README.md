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

## Prerequisites

- Node.js (v20.x recommended, as used in CI)
- npm (comes with Node.js)

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd trend-keyword-infuser-mvp
    ```

2.  **Install Root Dependencies:**
    These are primarily development tools for managing the monorepo.
    ```bash
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    npm install --prefix frontend
    ```

4.  **Install Backend Dependencies:**
    ```bash
    npm install --prefix backend
    ```

## Environment Variables

The backend requires certain API keys and configuration settings. These are managed via a `.env` file in the `backend/` directory.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a `.env` file:**
    Copy the example file:
    ```bash
    cp .env.example .env
    ```

3.  **Populate `.env`:**
    Open `backend/.env` in a text editor and fill in the required values (e.g., `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`). Refer to `backend/.env.example` for the list of required variables.

## Running the Application

### Running Frontend and Backend Concurrently (Recommended)

From the **root directory** of the project, you can start both the frontend and backend development servers simultaneously:

```bash
npm run dev
```

- The frontend (Next.js) will typically be available at `http://localhost:3000`.
- The backend (Node.js/Express) will typically be available at `http://localhost:3001` (or as configured in `backend/.env`).

### Running Separately

**Frontend Development Server:**

From the `frontend/` directory:
```bash
npm run dev
```
Or from the **root directory**:
```bash
npm run dev:frontend
```

**Backend Development Server:**

From the `backend/` directory:
```bash
npm run start
```
Or from the **root directory**:
```bash
npm run dev:backend
```

## Development Scripts

All commands below can be run from the **root directory**.

### Linting

- **Lint both frontend and backend:**
  ```bash
  npm run lint
  ```
- **Lint frontend only:**
  ```bash
  npm run lint:frontend
  # (Internally runs: next lint)
  ```
- **Lint backend only:**
  ```bash
  npm run lint:backend
  # (Internally runs: eslint .)
  ```

### Formatting (with Prettier)

- **Format both frontend and backend:**
  ```bash
  npm run format
  ```
- **Format frontend only:**
  ```bash
  npm run format:frontend
  # (Internally runs: prettier --write .)
  ```
- **Format backend only:**
  ```bash
  npm run format:backend
  # (Internally runs: prettier --write .)
  ```

- **Check formatting for both frontend and backend (no changes made):**
  ```bash
  npm run check-format
  ```
- **Check formatting for frontend only:**
  ```bash
  npm run check-format:frontend
  # (Internally runs: prettier --check .)
  ```
- **Check formatting for backend only:**
  ```bash
  npm run check-format:backend
  # (Internally runs: prettier --check .)
  ```

### Testing

- **Run backend tests (Jest):**
  ```bash
  npm run test
  # (Internally runs: npm run test --prefix backend, which runs: jest)
  ```
- **Run frontend tests (Jest with Next.js):**
  Navigate to the `frontend/` directory and run:
  ```bash
  npm run test
  # (Internally runs: jest --watch)
  ```
  *(Note: Frontend tests are typically run from within the `frontend` directory due to Jest's project-specific configuration within Next.js.)*


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

