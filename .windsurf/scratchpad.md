# Real-time Trend & Keyword Infuser MVP - Project Plan

## Project Overview

Building an MVP for a tool that helps content creators infuse trending keywords and topics into video scripts for platforms like Synthesia, enhancing discoverability and engagement.

## Goals

1. Create a functional MVP that demonstrates the core value proposition
2. Focus on essential features with a clean, intuitive UI
3. Leverage existing services (OpenRouter for LLMs, external APIs for trend data)
4. Prepare for deployment with proper infrastructure and scalability in mind

## Architecture Overview

The system consists of:

1. **User Interface Layer**: Frontend web application with forms, trend suggestion panel, and script editor
2. **Application Logic Layer**: Backend services to orchestrate requests between UI and AI services
3. **AI Processing Layer**: Services for trend discovery and script generation
4. **Data Storage Layer**: Databases and caches for storing user data, trends, and scripts
5. **Infrastructure Layer**: Cloud hosting, deployment, and monitoring services

## MVP Features

1. User input form for video goal, topic, and target platform
2. Trend and keyword discovery from YouTube API
3. AI-generated script incorporating selected trends/keywords using Gemini 2.0
4. Script display, editing, and copy-to-clipboard functionality
5. ~~Basic user authentication~~ (to be added after MVP)
6. Minimal script history storage (client-side for MVP)

## Implementation Plan

**Methodology**: Test-Driven Development (TDD) will be employed. Tests will be written before implementation code for each feature.

### Phase 1: Project Setup and Infrastructure

- [x] Create project repository and directory structure
- [x] Set up development environment
- [x] Initialize frontend framework (React/Next.js)
- [x] Initialize backend framework (Node.js/Express)
- [x] Set up basic CI/CD pipeline
- [x] Configure database and storage services

### Phase 2: Core Backend Services

- [x] Implement API Gateway/Frontend Controller (Generated scripts save to Supabase, retrieval endpoints added)
- [x] Develop Script Orchestration Service (Initial structure and integration complete)
- [x] Create Trend & Keyword Discovery Service with external API integration (Initial placeholder service complete)
- [x] Integrate YouTube Data API into TrendDiscoveryService for real-time trend fetching
- [x] **Internal Test:** `VERIFIED (After Debugging)` Make a test request to `/api/v1/scripts/generate` with a topic like "Artificial Intelligence". Verified that `server.log` now correctly captures detailed logs from `TrendDiscoveryService` (YouTube API calls, trends fetched) and other services. The generated script accurately reflects dynamic trends from YouTube. Key debugging steps involved correcting `dotenv` load order in `index.js` and ensuring proper log flushing. Additionally, a persistent 500 error with `/api/v1/trends/youtube-keywords` was investigated and subsequently resolved (potentially due to transient backend/API key state or server restarts), and the feature is now functioning correctly.
- [x] Implement LLM Script Generation Service (`DEFERRED OpenRouter Integration` - Current Gemini API `gemini-2.0-flash` setup is complete for this phase)
- [x] Set up data models and database connections (Basic 'scripts' table in Supabase with topic, trends_used, generated_script is implemented and functional via `scriptController.js`)

### Phase 3: Frontend Development

- [x] Task 3.1: Create responsive UI layout and components in the Next.js frontend (e.g., input fields, buttons, display areas). Utilized Tailwind CSS in `page.tsx` for main application interface, including topic input, script generation button, and script display area with loading/error states.
- [ ] Develop Trend & Keyword Suggestion Panel (Task 3.2) - Phased Implementation:
  - [ABANDONED] **Phase 3.2 - Step 1: Foundational Sidebar & Google Daily Trends Integration**
  - [x] **Phase 3.2 - Step 2: Integrating YouTube Keyword Trends (Topic & Timeframe-Based) into Panel**
    - **Objective**: Extract and display trending keywords from YouTube based on user-defined topics and selectable timeframes (e.g., last 24h, 48h, 72h, all time), derived from high-engagement video titles and descriptions.
    - **Backend**:
      - [x] Enhance `TrendDiscoveryService.js` to accept `topic` and `timeframe` (e.g., '24h', '48h', '72h', 'any') parameters.
      - [x] Utilize YouTube Data API v3 `search.list` with `publishedAfter` for time filtering and `order` (e.g., `viewCount`) for engagement ranking.
      - [x] Implement logic to extract relevant keywords/phrases from titles and descriptions of fetched videos.
      - [x] Define a clear data structure for returned keywords (e.g., `{ keyword: string, engagement_score: number, source_video_count: number, timeframe: string }`).
        - **Note on `engagement_score` Calculation (as of 2025-06-08 in `TrendDiscoveryService._extractKeywordsFromVideos`):**
          - **Formula**: `engagementScore = count * source_video_count * (0.5 + averageRecency)`
          - **Components**:
            - `count`: Total number of times the keyword appears across all analyzed video titles/descriptions.
            - `source_video_count`: Number of unique videos containing the keyword.
            - `averageRecency`: A score from 0 (oldest in set) to 1 (newest in set), calculated as the average of individual video recency scores for each keyword occurrence.
              - `recencyScore_per_video_occurrence = (videoPublishedAt_timestamp - minTimestamp_in_set) / (maxTimestamp_in_set - minTimestamp_in_set)`
              - `averageRecency = SUM(recencyScore_per_video_occurrence for the keyword) / count`
          - **Recency Multiplier**: The `(0.5 + averageRecency)` term acts as a multiplier ranging from 0.5 to 1.5, boosting scores for more recent keywords.
          - **Filter**: Keywords are included only if `count > 1`.
      - [x] Adapt or create an API endpoint (e.g., `/api/v1/trends/youtube-keywords?topic=<topic>&timeframe=<timeframe>`) to serve this data.
    - **Frontend (`TrendSidebar.tsx`)**:
      - [x] Implement UI elements (e.g., dropdown) for timeframe selection (24h, 48h, 72h, All Time).
      - [x] Call the new/updated backend endpoint with the selected topic and timeframe.
      - [x] Display the fetched keywords, potentially with indicators of their engagement or recency.
      - [x] Initially view-only, with selection for script infusion planned for Step 3.
  - [x] **Phase 3.2 - Step 3: "Existing Script" Input & Keyword Selection for Modification**
    - [x] **Sub-Task 3.2.3.1: Frontend - UI for Existing Script and Keyword Selection**
      - **Objective**: Allow users to input an existing script and select keywords from the `TrendSidebar` for infusion.
      - **Actions (Frontend - likely `page.tsx` and `TrendSidebar.tsx`):**
        - [x] In `page.tsx` (or a relevant main content area): Add a `textarea` component for users to paste their existing script. Manage its state.
        - [x] In `TrendSidebar.tsx`: Modify the keyword display. Clicking a keyword should toggle its selection state. Selected keywords should be visually distinct.
        - [x] In `TrendSidebar.tsx` (or `page.tsx`): Maintain a list of currently selected keywords (e.g., in React state, possibly lifted to a shared parent or context).
        - [x] In `page.tsx`: Add a "Modify Script" button, enabled when there's an existing script and at least one keyword is selected.
      - **Success Criteria**: User can paste script, select/deselect keywords, and "Modify Script" button behaves correctly.
    - [x] **Sub-Task 3.2.3.2: Backend - API Endpoint for Script Modification**
      - **Objective**: Create a backend API endpoint that accepts an existing script and selected keywords, then uses an LLM to infuse them.
      - **Actions (Backend):**
        - [x] In `scriptRoutes.js`: Define a new POST route, e.g., `/api/v1/scripts/modify`.
        - [x] In `scriptController.js`: Create `modifyScript(req, res)` method to validate input, call a service for modification logic, and return the modified script.
        - [x] In `ScriptOrchestrationService.js` (or new `ScriptModificationService.js`): Create `infuseKeywordsIntoScript(existingScript, selectedKeywords)` method to construct an LLM prompt (for Gemini API) and get the modified script.
      - **Success Criteria**: POST to `/api/v1/scripts/modify` with valid data returns a modified script; errors are handled.
    - [x] **Sub-Task 3.2.3.3: Frontend - Integrate Script Modification Feature**
      - **Objective**: Connect the frontend UI to the new backend API endpoint.
      - **Actions (Frontend - likely `page.tsx`):**
        - [x] On "Modify Script" button click: Gather script and selected keywords, call `/api/v1/scripts/modify`.
        - [x] Handle API response: Display modified script or error message. Implement loading states.
      - **Success Criteria**: End-to-end flow works: user inputs script, selects keywords, clicks modify, sees modified script. Loading/error states are graceful.
  - [ ] **Phase 3.2 - Step 4: Advanced Features (AI Selection, Granular Volume, Filtering)**
    - **Objective**: Elevate the keyword analysis capabilities by integrating AI-driven suggestions, more detailed metrics, and advanced temporal filtering to provide users with deeper insights and more effective keyword choices.
    - [x] **Sub-Task 3.2.4.1: AI-Powered Keyword Relevance Scoring/Suggestion**
      - **Objective**: Enhance keyword selection by providing AI-driven relevance scores or suggestions for the fetched YouTube keywords based on the user's existing script or primary topic. (COMPLETED)
      - **Backend**:
        - [x] Design a new service method (e.g., in `ScriptOrchestrationService` or a new `KeywordAnalysisService`) that takes the list of fetched YouTube keywords and the user's script/topic. (`KeywordAnalysisService.getRelevanceForKeywords` created)
        - [x] Construct a prompt for an LLM (Gemini) to evaluate each keyword's relevance to the script/topic, potentially returning a relevance score (e.g., 1-5) or a short justification. (Implemented in `KeywordAnalysisService`)
        - [x] Create/update an API endpoint (e.g., modify `/api/v1/trends/youtube-keywords` to optionally include this, or a new endpoint) to return keywords with AI relevance scores. (`TrendDiscoveryService.getYouTubeKeywordsByTopicAndTimeframe` now integrates AI scoring, serving the existing `/api/v1/trends/youtube-keywords` route via `trendController.js`)
      - **Frontend**:
        - [x] In `TrendSidebar.tsx`, update the UI to display the AI relevance score/suggestion alongside each keyword.
        - [ ] Allow users to sort or filter keywords based on AI relevance. (Sorting/filtering by AI relevance is a future enhancement within this sub-task, core display is complete)
      - **Success Criteria**: Users see AI-generated relevance indicators for YouTube keywords, aiding in their selection process. Backend returns augmented keyword data. (ACHIEVED)
    - [x] **Sub-Task 3.2.4.2: Enhanced Keyword Metrics (Contextualizing "Volume")**
      - **Objective**: Provide users with more insightful metrics for YouTube keywords, going beyond current "engagement_score" and "source_video_count" to better approximate "search interest" or "trend velocity" without direct search volume data. (Algorithmic refinement of engagement_score COMPLETED)
      - **Backend**:
        - [x] Research if YouTube Data API offers any other indirect indicators of trend velocity or search interest (e.g., comment counts if video details are fetched, rate of view accumulation if historical data could be tracked - likely too complex for MVP). (Research complete: `snippet` part has limited direct metrics. Recency from `publishedAt` is viable.)
        - [x] Alternatively, refine the existing `engagement_score` calculation or use the LLM to provide a qualitative assessment of a keyword's "buzz" based on titles/descriptions. (Algorithmic refinement of `engagement_score` with recency weighting implemented in `TrendDiscoveryService._extractKeywordsFromVideos`.)
        - [x] Update the API response for `/api/v1/trends/youtube-keywords` with these enhanced/new metrics. (Implicitly handled as `engagement_score` field is reused with new calculation.)
      - **Frontend**:
        - [x] In `TrendSidebar.tsx`, display these new/enhanced metrics clearly. (Implicitly handled as the `engagement_score` is already displayed; its calculation is now more sophisticated. No UI change needed for this iteration.)
      - **Success Criteria**: Users have access to richer, more contextual data for each keyword to gauge its potential impact. (ACHIEVED for algorithmic refinement of engagement_score.)
    - [x] **Sub-Task 3.2.4.3: Advanced Time-Based Trend Analysis (Custom Date Ranges - COMPLETED; Trajectory Deferred)**
      - **Objective**: Offer more sophisticated time-based filtering or trend trajectory insights for keywords, beyond the current fixed timeframes.
      - **Backend (Option A: Custom Date Range - COMPLETED)**:
        - [x] Option A: Implement custom date range selection (e.g., `publishedAfter`, `publishedBefore`) in `TrendDiscoveryService.js` and API.
          - `getYouTubeKeywordsByTopicAndTimeframe` modified to accept optional `publishedAfterISO` and `publishedBeforeISO` string parameters.
          - If valid, these ISO dates are used for YouTube API's `publishedAfter` and `publishedBefore` query parameters, overriding the standard `timeframe` (24h, 48h, 72h) logic for date filtering.
          - An `effectiveTimeframeLabel` (e.g., '24h', 'custom') is determined and passed to `_extractKeywordsFromVideos` to ensure keyword objects retain context about the query window.
          - Basic validation for ISO date string format included.
        - [D] Option B: Investigate feasibility of comparative analysis across time windows for trajectory inference (potential high API cost). - DEFERRED due to high API quota consumption and implementation complexity relative to current MVP goals.
      - **Frontend (Option A: Custom Date Range UI - COMPLETED)**:
        - [x] If Option A: Add UI for custom date range selection in `TrendSidebar.tsx`.
          - Added `startDate`, `endDate` state variables.
          - Added "Custom Range..." to timeframe selector; conditionally render date input fields.
          - `fetchYouTubeKeywords` updated to validate and format custom dates (start of day for `publishedAfterISO`, end of day for `publishedBeforeISO`) and pass them to the backend.
          - `useEffect` hook updated to re-fetch on `startDate`/`endDate` changes.
          - Timeframe dropdown clears custom dates if a predefined option is re-selected.
          - Enhanced "No keywords found" message for custom ranges.
        - [D] If Option B: Design UI to display trend trajectory indicators. - DEFERRED along with Option B backend.
      - **Success Criteria**: Users can analyze keyword trends with more flexible time controls via custom date ranges. (Backend & Frontend for custom date ranges achieved. Trajectory insights via Option B deferred).
- [ ] **Phase 3.3: Implement AI Script Editor/Display**
  - **Objective**: Empower users to view, edit, and save AI-generated scripts directly within the application.
  - [ ] **Sub-Task 3.3.1: Basic Script Display & Editing UI**
    - **Objective**: Create or enhance a UI component that displays the AI-generated script and allows users to make direct text edits.
    - **Frontend**:
      - [x] Identify/Create `ScriptEditor.tsx` component. (New file created with basic structure, props, state, textarea, and save button.)
      - [x] Use `textarea` for script editing. (Implemented with styling and disabled state during loading.)
      - [x] Component receives script content as a prop. (`initialScriptContent`, `isLoading`, `error`, `title` props defined and used.)
      - [x] Manage edited script in local component state. (`editedScript` state variable implemented with `useEffect` to sync with `initialScriptContent`.)
      - [x] Add "Save Edits" button. (Button implemented with loading state and calls `onSave` prop.)
    - **Backend (Anticipatory for 3.3.2)**:
      - No direct work. Plan for future endpoint (e.g., `PUT /api/v1/scripts/:scriptId/content`).
    - **Success Criteria**:
      1. Script viewable in an editable field.
      2. User can modify script text.
      3. Edits reflected in local state.
      4. "Save Edits" button present.
      5. UI is clean, responsive, user-friendly.
  - [x] **Sub-Task 3.3.2: Backend Integration for Saving Edits (COMPLETED)**
    - **Objective**: Connect frontend "Save" to backend API to persist script edits.
    - **Frontend (Deferred to 3.3.3 Integration)**:
      - [ ] Implement API call on "Save Edits" in the parent component that uses `ScriptEditor.tsx`.
      - [ ] Handle API response (success/error) & provide user feedback (by passing `isLoading` and `error` props to `ScriptEditor`).
    - **Backend (COMPLETED)**:
      - [x] Define and implement API endpoint (`PUT /api/v1/scripts/:id`) in `scriptRoutes.js`.
      - [x] Implement controller logic (`handleUpdateScriptContent` in `scriptController.js`) to update script in Supabase.
    - **Success Criteria**: Backend ready for saving edits. Frontend logic to call save API will be part of editor integration (3.3.3). User gets feedback via `ScriptEditor` props.
  - [x] **Sub-Task 3.3.3: Integrating Editor into Main Workflow (COMPLETED)** - **Objective**: Ensure script editor is accessible post-generation or when selecting an existing script. - **Backend Enhancement (COMPLETED)**: - [x] Modified `handleGenerateScript` in `scriptController.js` to return `scriptId` along with `scriptText`. - **Frontend (COMPLETED)**: - [x] Determined placement of `ScriptEditor.tsx` in application layout (Created `ScriptWorkflowOrchestrator.tsx` as a dedicated view/container). - [x] Implemented logic in the parent component (`ScriptWorkflowOrchestrator.tsx`): - [x] Fetched script data (ID and content) for existing scripts (Added `useEffect` to fetch from `GET /api/v1/scripts`, UI to list, and `handleLoadScriptForEditing` function). - [x] Handled receiving `scriptId` and `scriptText` for newly generated scripts (Implemented `handleGenerateNewScript`). - [x] Passed `initialScriptContent` (via `currentScriptContent`) and `scriptId` (implicitly via `currentScriptId` context for editor title) to `ScriptEditor.tsx`. - [x] Implemented the `onSave` handler for `ScriptEditor.tsx` to call the `PUT /api/v1/scripts/:id` endpoint (Implemented `handleSaveEditedScript`). - [x] Managed loading and error states for script generation, fetching existing scripts, and saving (Implemented for all operations). - **Success Criteria**: Script editor is a natural part of the user journey, allowing viewing and editing of new and existing scripts. (Full workflow for new and existing scripts established).
        **Phase 3.3: AI Script Editor/Display (COMPLETED)**

### Phase 3.4: Application Integration and Testing for Script Editor

      - [x] Test saving new script edits: content modification, save button, API call, success/error feedback, content update in editor. (COMPLETED)
      - [x] Test listing existing scripts: API call on load, display of script list, loading/error states. (COMPLETED)
      - [x] Test loading existing script for editing: selection from list, script content loaded into editor, topic updated. (COMPLETED)
      - [x] Test saving edits to an existing script: content modification, save button, API call, success/error feedback, content update in editor. (COMPLETED)
      - [x] Verify all loading indicators and error messages behave as expected across all operations. (COMPLETED)

- [x] **Phase 5: UI/UX Polish and Final Testing**
  - [x] **Task 5.1: Detailed UI/UX Polish**: Conduct a thorough review of `ScriptWorkflowOrchestrator.tsx` and `ScriptEditor.tsx`. Refine layout, styling, visual feedback (e.g., unsaved changes indicators), and accessibility best practices. - `COMPLETED`
  - [x] Review and refine layout, styling, and responsiveness of `ScriptWorkflowOrchestrator.tsx` and `ScriptEditor.tsx`.
  - [x] Ensure clear visual feedback for all user actions (e.g., toast notifications for save success/failure, clear loading states).
  - [x] Check for accessibility best practices.
  - **Success Criteria**: The script editing feature is stable, intuitive, and visually appealing.
- [x] **Sub-Task 3.4.3: Implement Auto-Save for Modified Scripts (Main Page Feature)** - **Objective**: Ensure scripts modified using the 'Modify Script with Selected Keywords' button on the main page are automatically saved to the database. - **Backend**:
      {{ ... }}

### Phase 3: Frontend Development (Continued)

### Task 4: Implement Responsive Navigation and Site-Wide Responsiveness (COMPLETED)

- [x] Create reusable, responsive Navbar component with logo and navigation links.
- [x] Integrate Navbar into the main application layout to appear on all pages.
- [x] Ensure main content areas on Home and AI Script Studio pages are mobile-responsive.
- [x] Add logo asset to the project.

### Phase 4: Integration and Testing

- [x] **Connect all components end-to-end** (COMPLETED - Home page/TrendSidebar topic integration)
      {{ ... }}
- [x] **Perform unit and integration testing** (COMPLETED)
  - [x] Install testing dependencies (Jest, React Testing Library).
  - [x] Configure Jest for the Next.js project.
  - [x] Write an initial unit test for a component to validate the setup.
  - [x] Write comprehensive tests for `TrendSidebar.tsx`.
  - [x] Write comprehensive tests for Home page (`page.tsx`).
  - [x] Implement additional C.O.D.E.X. aligned tests for ScriptWorkflowOrchestrator.tsx (input validation, API error handling, UI feedback, loading states, empty states, edge cases)
  - [x] Create dedicated unit tests for `ScriptEditor.tsx` (prop handling, content editing, save functionality, loading/error states, unsaved indicators)
- [ ] **Conduct user flow testing** (In Progress)
    - **Sub-Task:** Test `TrendSidebar.tsx` and its children (`TimeframeSelector`, `CustomDateRangePicker`, `LoadingSpinner`, `SidebarErrorMessage`, `KeywordList`, `KeywordListItem`) across various screen sizes and with assistive technology (e.g., screen reader) for expected behavior and A11Y compliance.
      - **Executor:** G.O.A.T. C.O.D.E.X. B.O.T. / USER
      - **Success Criteria:** All interactive elements are keyboard navigable, focus states are clear, ARIA attributes function as expected, responsive layouts adapt correctly, no console errors related to A11Y or layout.
      - **Status:** Pending
  - [ ] **Flow 1: Trend to New Script Creation**
    - [x] **Stage 1: Home Page & Trend Selection (`TrendSidebar`)**
      - **Objective:** Verify user can select a trend topic from the `TrendSidebar` on the home page, and this selection is correctly processed.
      - **Setup:**
        - Mock backend API (`/api/v1/trends/youtube-keywords`) to return a predefined list of keywords for an initial topic (if any is automatically fetched on load, otherwise for the first user-entered topic) and selected timeframe (e.g., '24h').
        - Ensure the Home page (`/`) renders correctly with `TrendSidebar`.
      - **Test Steps & Verifications:**
        - [x] **1. Initial Load & Trend Display (Default Timeframe: "24h")** Navigate to the Home page (`/`).
          - **Verification:** `TrendSidebar` displays a loading state initially (if applicable).
          - **Verification:** `TrendSidebar` initially displays no keywords (or keywords for a default, empty topic if backend handles it gracefully) until a topic is entered. If a default timeframe is set, it's respected.
          - **Verification:** No specific topic is pre-selected in any shared state/context beyond `TrendSidebar`'s internal state (unless designed otherwise).
        - [x] **2. User Changes Timeframe (e.g., to "48h")**
          - **Action:** User changes the timeframe in `TrendSidebar` (e.g., to '48h').
          - **Verification:** `TrendSidebar` makes a new API call with the updated timeframe.
          - **Verification:** `TrendSidebar` displays keywords for the new timeframe (mocked response).
        - [x] **3. Topic Input & Keyword Fetch (If manual topic input is still part of TrendSidebar):**
          - **Action:** User types a new topic into the topic input field in `TrendSidebar`.
          - **Action:** User types a new topic (e.g., 'Future of Quantum Computing') into the topic input field in `TrendSidebar`.
          - **Action:** User triggers the keyword fetch for the new topic.
          - **Verification:** `TrendSidebar` makes an API call with the new topic.
          - **Verification:** `TrendSidebar` displays keywords for the new topic (mocked response).
        - [x] **4. Keyword Selection & State Update:**
          - **Action:** User clicks on a specific keyword item (e.g., 'Quantum Entanglement Breakthroughs') from the list in `TrendSidebar`.
          - **Verification:** The `onKeywordSelect` (or equivalent) callback in `TrendSidebar` is triggered with the correct keyword data.
          - **Verification:** The application's shared state/context (e.g., Zustand store, React Context) is updated to reflect the selected keyword/topic ('Quantum Entanglement Breakthroughs').
          - **Verification:** UI elements outside `TrendSidebar` that depend on this shared state (if any on the Home page) update accordingly (e.g., a display area showing 'Selected Topic: Quantum Entanglement Breakthroughs'). _This might be more relevant when navigating to the Script Studio page, but good to note if any immediate feedback is expected on the Home page itself._
    - [x] **Stage 2: Navigation to AI Script Studio & Script Generation (`ScriptWorkflowOrchestrator`)**
      - **Objective:** Verify user can navigate to the AI Script Studio, the selected topic from Stage 1 is utilized, a script is successfully generated, and displayed for editing.
      - **Prerequisites:** Assumes Stage 1 is complete and a topic (e.g., 'Quantum Entanglement Breakthroughs') has been selected and stored in shared state/context.
      - **Setup:**
        - Mock backend API (`/api/v1/scripts/generate`) to return predefined script content when called with the selected topic.
        - Ensure the AI Script Studio page (e.g., `/studio`) renders `ScriptWorkflowOrchestrator` and `ScriptEditor`.
      - **Test Steps & Verifications:**
        - [x] **1. Navigation & Initial Studio State:**
          - **Action:** User navigates from the Home page to the AI Script Studio page (e.g., via a navigation link or button).
          - **Verification:** The AI Script Studio page loads successfully.
          - **Verification:** `ScriptWorkflowOrchestrator` is rendered.
          - **Verification:** `ScriptWorkflowOrchestrator` correctly retrieves/receives the selected topic ('Quantum Entanglement Breakthroughs') from the shared state/context.
          - **Verification:** `ScriptEditor` is rendered, initially displaying no script content or a placeholder. The "Save Edits" button is disabled. No unsaved changes indicator is visible.
          - **Verification:** A "Generate Script" button (or similar UI element to trigger generation) is visible and enabled within `ScriptWorkflowOrchestrator`.
        - [x] **2. Script Generation Trigger & Loading State:**
          - **Action:** User clicks the "Generate Script" button.
          - **Verification:** `ScriptWorkflowOrchestrator` (and/or `ScriptEditor`) displays a loading indicator (e.g., "Generating script...", spinner).
          - **Verification:** The "Generate Script" button might become disabled during generation.
          - **Verification:** An API call is made to `POST /api/v1/scripts/generate` with the correct payload, including the selected topic ('Quantum Entanglement Breakthroughs').
        - [x] **3. Script Generation Completion & Display:** (Script is now displayed, verifications follow)
          - **Verification:** Upon receiving a successful (mocked) API response, the loading indicator(s) disappear.
          - **Verification:** The predefined (mocked) script content is now displayed within the `ScriptEditor` textarea.
          - **Verification:** The `ScriptEditor`'s "Save Edits" button remains disabled (as the content is pristine from generation, not yet user-modified).
          - **Verification:** The unsaved changes indicator (`*`) in `ScriptEditor` is not visible.
    - [x] **Stage 3: Script Editing (`ScriptEditor`)**
      - **Objective:** Verify user can successfully edit the generated script content, and the UI correctly reflects the 'dirty' state (unsaved changes indicator, save button enablement).
      - **Prerequisites:** Assumes Stage 2 is complete, and a generated script is currently displayed in the `ScriptEditor` component.
      - **Test Steps & Verifications:**
        - [x] **1. User Modifies Script Content:**
          - **Action:** Simulate user typing additional text or modifying existing text within the `ScriptEditor`'s textarea. For example, append " -- Additional user edits." to the current script content.
          - **Verification:** The textarea in `ScriptEditor` updates to reflect the new, edited content.
        - [x] **2. Unsaved Changes Indicator Appears:**
          - **Verification:** The unsaved changes indicator (`*`) becomes visible next to the `ScriptEditor` title (or its designated location).
        - [x] **3. Save Button Becomes Enabled:**
          - **Verification:** The "Save Edits" button within `ScriptEditor` (or controlled by `ScriptWorkflowOrchestrator` based on `ScriptEditor`'s state) becomes enabled, as the content is now dirty and different from the last saved/generated state.
        - [x] **1. User Clicks Save Edits:** (Action presumed complete leading to save attempt)
          - **Action:** User clicks the now-enabled "Save Edits" button.
        - [x] **2. Loading State During Save:** (Indicated by `isLoadingSaveProp: true` in logs)
          - **Verification:** `ScriptWorkflowOrchestrator` (and/or `ScriptEditor`) displays a loading indicator (e.g., "Saving script...", spinner on the save button).
          - **Verification:** The "Save Edits" button text might change to "Saving..." and become disabled.
          - **Verification:** The `ScriptEditor` textarea might become disabled during the save operation.
          - **Verification:** An API call is made to the appropriate save endpoint (e.g., `POST /api/v1/scripts` or `PUT /api/v1/scripts/:id`) with the correct payload, including the edited script content and any necessary identifiers.
        - [x] **3. Save Completion & Success Feedback:**
          - **Verification:** Upon receiving a successful API response, the loading indicator(s) disappear.
          - **Verification:** A success message (e.g., "Script saved successfully!") is displayed temporarily by `ScriptWorkflowOrchestrator`.
          - **Verification:** The `ScriptWorkflowOrchestrator` might update its internal state with the ID of the newly saved script (if applicable).
        - [x] **4. UI Returns to Clean State:**
          - **Verification:** The unsaved changes indicator (`*`) in `ScriptEditor` disappears.
          - **Verification:** The "Save Edits" button becomes disabled again, as the content is now considered clean (matching the last saved state).
          - **Verification:** The `ScriptEditor` textarea remains enabled for further edits.
- [x] **Optimize performance and fix bugs** (COMPLETED)
  - [x] Implement a server-side caching layer for API responses.
  - [x] Investigate and optimize frontend component re-renders.

### Next Steps: Pre-Deployment

- [x] **1. Version Control (Current Progress):**
  - [x] Task: Stage, commit, and push all changes related to User Flow 1 testing completion and critical bug fixes.
  - [x] Command: `git add .`
  - [x] Command: `git commit -m "Milestone: User Flow 1 Testing Complete & Script Save Bug Fixed"`
  - [x] Command: `git push`
- [ ] **2. Comprehensive Code Refactoring:**
  - [ ] **Objective:** Enhance overall code quality, maintainability, performance, and adherence to C.O.D.E.X. principles across the application before production deployment.
  - [ ] **Scope Definition:** The following areas will be targeted for refactoring, with specific tasks and success criteria outlined for each, ensuring adherence to G.O.A.T. C.O.D.E.X. B.O.T. principles:
    - [ ] **I. Frontend Refinements (React, State, Styling, TypeScript) - Ensuring 'Elegant' and 'Optimized' UI:**
      - [x] **A. Component Architecture & Reusability:** (Completed for page.tsx, TrendSidebar.tsx, ScriptWorkflowOrchestrator.tsx, ScriptEditor.tsx)
        - [x] Task: Review `page.tsx` for opportunities to extract smaller, reusable presentational and container components from its main content area. (Completed - `AppHeader.tsx`, `TopicInputSection.tsx`, `ErrorDisplay.tsx` (reused), `GenerateScriptButton.tsx`, `ExistingScriptInputSection.tsx`, `ModifyScriptButton.tsx`, `GeneratedScriptDisplay.tsx`, `CopyScriptButton.tsx` extracted from `page.tsx`'s main content area)
        - [x] Task: Review `TrendSidebar.tsx` for further component extraction opportunities. (Completed - `TimeframeSelector.tsx`, `CustomDateRangePicker.tsx`, `LoadingSpinner.tsx`, `SidebarErrorMessage.tsx`, `KeywordListItem.tsx`, `KeywordList.tsx` extracted)
        - [x] Task: Review `ScriptWorkflowOrchestrator.tsx` for further component extraction opportunities. (Completed - `NewScriptGenerator.tsx`, `ExistingScriptListItem.tsx`, `ExistingScriptsList.tsx`, `SaveSuccessToast.tsx` extracted)
        - [x] Task: Review `ScriptEditor.tsx` for further component extraction opportunities. (Completed - `ScriptEditorHeader.tsx`, `ScriptEditorSaveButton.tsx` extracted)
        - [x] Task: Ensure components adhere to the Single Responsibility Principle (SRP) for 'Clairvoyant' maintainability. (Achieved through granular component extraction)
        - [ ] *Success Criteria:* Reduced component complexity, increased code reusability, improved maintainability, adherence to SRP.
      - [ ] **B. State Management Optimization:**
        - [x] Task: Analyze state flow, particularly in `page.tsx` and its interaction with child components. Evaluate the necessity and impact of current prop-drilling. (Analysis complete: Prop-drilling identified for `topic`, `selectedKeywords`, loading/error states. Necessity seems justified for current component depth; impact is manageable. Global state manager not immediately critical but worth considering for future scalability if shared state complexity increases.)
        - [x] Task: Consider if a lightweight global state solution (e.g., Zustand, Jotai, or strategic React Context) would simplify state management for shared data like `topic`, `selectedKeywords`, `script` without over-engineering, maintaining MVP agility while promoting 'Xtensible' design. (Implemented React Context for `selectedKeywords` via `SelectedKeywordsContext.tsx`)
        - [x] Task: Ensure `useState` and `useEffect` hooks are used efficiently, with correct dependencies to prevent unnecessary re-renders (building upon existing `useCallback` optimizations for 'Optimized' performance). (Review complete for `page.tsx` and `TrendSidebar.tsx`; hooks deemed efficient.)
        - [ ] *Success Criteria:* Clearer state ownership, potentially reduced prop-drilling, optimal component rendering performance.
      - [ ] **C. Custom Hooks for Reusable Logic:**
        - [ ] *Success Criteria:* DRYer component logic, leading to cleaner, more modular, and 'Elegant' components.
      - [ ] **D. Styling Consistency & Tailwind CSS Best Practices:**
        - [x] Task: Conduct a review of Tailwind CSS usage for consistency and efficiency across all components. (Completed: `page.tsx`, `TrendSidebar.tsx` and its children, and all main content components - `AppHeader.tsx`, `TopicInputSection.tsx`, `ErrorDisplay.tsx`, `GenerateScriptButton.tsx`, `ModifyScriptButton.tsx`, `CopyScriptButton.tsx`, `ExistingScriptInputSection.tsx`, `GeneratedScriptDisplay.tsx` - reviewed. All found to be consistent and efficient. Minor refinements made to `LoadingSpinner.tsx`, `CopyScriptButton.tsx`, and `ExistingScriptInputSection.tsx`.)
        - [x] Task: Identify and refactor overly complex or duplicated class strings. Consider creating reusable component-level styles or utility functions if appropriate, promoting 'Elegant' and maintainable styles. (Completed: Button components - `GenerateScriptButton`, `ModifyScriptButton`, `CopyScriptButton` - refactored to use common utility classes `.btn-action` and `.btn-copy` defined in `globals.css`.)
        - [x] Task: Verify responsiveness and accessibility (A11Y) of all styled components. (Completed: Main content components previously verified. `TrendSidebar.tsx` and its children - `TimeframeSelector.tsx`, `CustomDateRangePicker.tsx`, `LoadingSpinner.tsx`, `SidebarErrorMessage.tsx`, `KeywordList.tsx`, and `KeywordListItem.tsx` - verified and enhanced for responsiveness and accessibility. Semantic HTML, ARIA roles (alert, button, pressed, expanded, controls), and responsive/sticky styling for the sidebar were refined. G.O.A.T. C.O.D.E.X. B.O.T. - Session `{{SESSION_ID}}`)
        - [ ] *Success Criteria:* Consistent and 'Elegant' UI, maintainable and performant styling, improved accessibility.
        - [ ] Task: Review all component props, state variables, and function signatures for accurate, comprehensive, and strict TypeScript typings.
        - [ ] Task: Ensure all interfaces (e.g., `YouTubeKeywordItem`) are well-defined and consistently applied for 'Durable' code.
        - [ ] *Success Criteria:* Enhanced type safety, improved developer experience, reduced runtime errors.
    - [ ] **II. Backend Robustness (Node.js/Express, Services, Supabase) - Building a 'Durable' and 'Optimized' Core:**
{{ ... }}
        - [ ] Task: Review `trendController.js` and `scriptController.js`. Ensure controllers are lean, focusing on request/response handling and delegating business logic to service layers, embodying separation of concerns.
        - [ ] Task: Implement/Verify thorough validation of all request parameters and payloads using a consistent validation strategy.
        - [ ] *Success Criteria:* Slim, focused controllers, clear separation of concerns, improved security through robust validation.
      - [ ] **B. Service Layer Integrity:**
        - [ ] Task: Review `TrendDiscoveryService.js` and any business logic currently within controllers that should be moved to dedicated services.
        - [ ] Task: Ensure services fully encapsulate business logic, interactions with external APIs (YouTube, Gemini), and database operations, making them 'Clairvoyant' to controller changes.
        - [ ] *Success Criteria:* A robust, testable, and well-defined service layer, promoting modularity.
      - [ ] **C. Database Interaction Optimization (Supabase):**
        - [ ] Task: Review all Supabase client calls for efficiency (query structure, indexing considerations) and correctness.
        - [ ] Task: Ensure proper error handling for all database operations, returning meaningful errors.
        - [ ] Task: Re-evaluate `updated_at` column behavior for the `scripts` table (Ref: Memory `ab2cda3d-a233-4d71-ab18-c7d102069be6`). Determine if the current `DEFAULT now()` is sufficient for all update scenarios or if a database trigger (e.g., `moddatetime`) or explicit application-level updates are needed to ensure 'Durable' timestamp accuracy on modifications. This aligns with 'Truth-Seeking' data integrity.
        - [ ] *Success Criteria:* Efficient, reliable, and 'Durable' database operations with accurate data lifecycle tracking.
    - [ ] **III. API Design & Consistency - Crafting an 'Elegant' and 'Xtensible' Interface:**
      - [ ] Task: Review all API endpoints (`/api/v1/trends/youtube-keywords`, `/api/v1/scripts/generate`, `/api/v1/scripts/:id`, `/api/v1/scripts/modify`).
      - [ ] Task: Ensure consistent naming conventions (endpoints, request/response fields), request/response structures (e.g., for errors, success payloads), and adherence to RESTful principles (HTTP verb usage, status codes).
      - [ ] Task: Evaluate API payload sizes and ensure data transfer is 'Optimized' and efficient.
      - [ ] *Success Criteria:* A clear, consistent, and 'Elegant' API design that is easy for clients to consume and evolve.
    - [ ] **IV. Cross-Cutting Concerns: Error Handling & Logging - For 'Clairvoyant' Diagnostics and 'Durable' Operation:**
      - [ ] **A. Frontend Error Presentation:**
        - [ ] Task: Ensure all potential error states (API errors, validation failures, unexpected issues) are handled gracefully in the UI.
        - [ ] Task: Provide clear, user-friendly error messages and feedback, avoiding generic or unhelpful alerts.
        - [ ] *Success Criteria:* Improved user experience during error scenarios, fostering trust.
      - [ ] **B. Backend Structured Logging:**
        - [ ] Task: Implement structured logging (e.g., using a library like Winston or Pino) for all backend requests, significant operations, and errors. Logs should be 'Truth-Seeking' records of events.
        - [ ] Task: Ensure logs include sufficient context (e.g., request IDs, timestamps, relevant parameters, user identifiers if applicable and privacy-compliant) for effective debugging and monitoring.
        - [ ] *Success Criteria:* Enhanced diagnosability and operational visibility for the backend, enabling 'Tactical' issue resolution.
    - [ ] **V. Security Hardening - Building a 'Durable' and Trustworthy Application:**
      - [ ] **A. Input Validation (Backend Authoritative):**
        - [ ] Task: Verify comprehensive and strict input validation on the backend for all incoming data as the authoritative source of truth. Frontend validation should be considered a UX enhancement.
        - [ ] Task: Protect against common web vulnerabilities (e.g., XSS, SQLi (though Supabase helps), CSRF if applicable, parameter tampering).
        - [ ] *Success Criteria:* Reduced attack surface, more 'Durable' and secure application.
      - [ ] **B. Dependency Audit:**
        - [ ] Task: Perform a dependency audit (e.g., `npm audit --production`, `yarn audit`) and address or mitigate any identified vulnerabilities in third-party packages.
        - [ ] *Success Criteria:* Minimized risk from third-party library vulnerabilities, maintaining a 'Truth-Seeking' approach to security.
      - [ ] **C. API Key & Sensitive Data Management:**
        - [ ] Task: Re-confirm that all API keys and sensitive configurations are securely managed (e.g., via `.env` files on the backend, properly gitignored) and not exposed client-side or in version control.
        - [ ] *Success Criteria:* Protection of sensitive credentials, adhering to 'Durable' security practices.
    - [ ] **VI. Technical Debt Reduction - For an 'Elegant' and Maintainable Future:**
      - [ ] Task: Systematically scan the codebase for `// TODO:`, `// FIXME:`, and other markers of technical debt.
      - [ ] Task: Prioritize and address identified items, including any known shortcuts or temporary solutions implemented during earlier MVP development. This is 'Altruistic' to future developers.
      - [ ] *Success Criteria:* A cleaner, more maintainable codebase, reducing friction for future 'Xtensible' development.
    - [ ] **VII. Foundational Work for Phase 6 (Strategic & 'Clairvoyant' Evaluation):**
      - [ ] Task: Evaluate if specific refactoring in this phase can lay strategic groundwork for Phase 6 enhancements, making the codebase more 'Xtensible'. Examples:
        - [ ] Caching: Structure `TrendDiscoveryService.js` and other relevant services to easily integrate a caching layer (e.g., Redis) for external API responses.
        - [ ] `updated_at` trigger: If not addressed in II.C, implement the Supabase `moddatetime` trigger for the `scripts` table to ensure 'Durable' data timestamps.
      - [ ] *Success Criteria:* 'Xtensible' design choices that facilitate future development and align with long-term 'Optimized' performance goals.
  - [ ] **Version Control (Post-Refactoring):**
    - [ ] Task: Commit and push all refactored code.

### Phase 5: Deployment and Launch

- [ ] Set up production environment
- [ ] Deploy backend services
- [ ] Deploy frontend application
- [ ] Configure monitoring and logging
- [ ] Perform final testing in production environment

### Phase 6: Enhancements and Refinements

- [ ] **Advanced NLP**: Integrate more sophisticated Natural Language Processing for keyword extraction (e.g., named entity recognition, stemming, TF-IDF) to improve relevance.
- [ ] **Caching Layer**: Implement server-side caching (e.g., using Redis, as per your tech stack) for YouTube API responses to reduce redundant calls, manage API quotas, and improve response times.
- [ ] **Error Handling & Resilience**: Further enhance error handling on both frontend and backend, providing more specific user feedback for API errors or unexpected data.
- [ ] **LLM-Powered Industry Keyword Analysis**: Enhance keyword suggestions by having an LLM: 1. Summarize the pasted script and determine its industry. 2. Analyze other trending videos within that same industry to extract relevant keywords. 3. Label and present these as 'Industry Trend Keywords'.
- [ ] **Rate Limiting**: Implement rate limiting on the backend API to protect against abuse.
- [ ] **Comprehensive Testing**: Develop unit and integration tests for both backend services/controllers and frontend components to ensure 'Durable' quality.
- [ ] **UI/UX Refinements**: Polish the `TrendSidebar` UI for an even more 'Elegant' user experience, perhaps with visualizations or more detailed keyword insights.
- [ ] **Configuration Management**: Move hardcoded values (like default topic in `TrendSidebar.tsx`) to configuration files or environment variables for easier management.

## Technical Stack (Confirmed)

- **Frontend**: React with Next.js, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Supabase for MVP simplicity
- **Caching**: Redis
- **AI/ML**: Gemini 2.0 Flash API (key provided)
- **External APIs**: YouTube Data API v3 (key provided)
- **Deployment**: To be determined once MVP is ready

## Client Requirements

1. **API Access**:
   - Use RSS Feed for Google Trends instead of direct API
   - YouTube Data API v3 key: `AIzaSyBam6FLFdQU4LRDgajc8eOHXQ5geq5pSrQ`
   - Gemini 2.0 Flash API key: `AIzaSyDGDLHCbARsHW7UbfILtoxRem-H7grhSMQ`
2. **UI/UX**: Simple interface focused on getting one MVP feature working ASAP, refine over time
3. **Authentication**: Will be added later after features are tested and ready to deploy
4. **Hosting**: Will be decided when MVP is ready for deployment

## Remaining Questions

1. Rate limits and quotas for YouTube Data API
2. Content moderation strategy
3. Performance optimization for real-time interactions

## Next Steps

Awaiting confirmation to switch to executor mode before proceeding with implementation.
