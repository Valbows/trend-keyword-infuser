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
- [x] **Internal Test:** `VERIFIED (After Debugging)` Make a test request to `/api/v1/scripts/generate` with a topic like "Artificial Intelligence". Verified that `server.log` now correctly captures detailed logs from `TrendDiscoveryService` (YouTube API calls, trends fetched) and other services. The generated script accurately reflects dynamic trends from YouTube. Key debugging steps involved correcting `dotenv` load order in `index.js` and ensuring proper log flushing.
- [x] Implement LLM Script Generation Service (`DEFERRED OpenRouter Integration` - Current Gemini API `gemini-2.0-flash` setup is complete for this phase)
- [x] Set up data models and database connections (Basic 'scripts' table in Supabase with topic, trends_used, generated_script is implemented and functional via `scriptController.js`)

### Phase 3: Frontend Development

- [x] Task 3.1: Create responsive UI layout and components in the Next.js frontend (e.g., input fields, buttons, display areas). Utilized Tailwind CSS in `page.tsx` for main application interface, including topic input, script generation button, and script display area with loading/error states.
- [ ] Develop Trend & Keyword Suggestion Panel (Task 3.2) - Phased Implementation:
  - [ABANDONED] **Phase 3.2 - Step 1: Foundational Sidebar & Google Daily Trends Integration**
  - [ ] **Phase 3.2 - Step 2: Integrating YouTube Keyword Trends (Topic & Timeframe-Based) into Panel**
    - **Objective**: Extract and display trending keywords from YouTube based on user-defined topics and selectable timeframes (e.g., last 24h, 48h, 72h, all time), derived from high-engagement video titles and descriptions.
    - **Backend**:
      1. Enhance `TrendDiscoveryService.js` to accept `topic` and `timeframe` (e.g., '24h', '48h', '72h', 'any') parameters.
      2. Utilize YouTube Data API v3 `search.list` with `publishedAfter` for time filtering and `order` (e.g., `viewCount`) for engagement ranking.
      3. Implement logic to extract relevant keywords/phrases from titles and descriptions of fetched videos.
      4. Define a clear data structure for returned keywords (e.g., `{ keyword: string, engagement_score: number, source_video_count: number, timeframe: string }`).
      5. Adapt or create an API endpoint (e.g., `/api/v1/trends/youtube-keywords?topic=<topic>&timeframe=<timeframe>`) to serve this data.
    - **Frontend (`TrendSidebar.tsx`)**:
      1. Implement UI elements (e.g., dropdown) for timeframe selection (24h, 48h, 72h, All Time).
      2. Call the new/updated backend endpoint with the selected topic and timeframe.
      3. Display the fetched keywords, potentially with indicators of their engagement or recency.
      4. Initially view-only, with selection for script infusion planned for Step 3.
  - [ ] **Phase 3.2 - Step 3: "Existing Script" Input & Keyword Selection for Modification**
    - **Frontend**:
      1. Add textarea for existing script.
      2. Enable selection of trends/keywords from sidebar.
    - **Backend**:
      1. New API endpoint (e.g., `/api/v1/scripts/modify`) accepting script and selected trends.
      2. LLM logic to modify script with selected items.
  - [ ] **Phase 3.2 - Step 4: Advanced Features (AI Selection, Granular Volume, Filtering)**
    - Future enhancements: AI keyword selection, detailed search volume data, time-based filtering.
- [ ] Implement AI Script Editor/Display
- [~] Add action buttons and loading indicators (Initial loading/error states implemented in Task 3.1. Added 'Copy Script' button with success feedback, styled scrollbars for script display, and a loading spinner icon to the 'Generate Script' button.)
- [~] Integrate frontend with backend APIs (Script generation API `/api/v1/scripts/generate` successfully integrated and tested end-to-end. Further API integrations may be needed for other features.)

### Phase 3: Frontend Development (Continued)



### Phase 4: Integration and Testing

- [ ] Connect all components end-to-end
- [ ] Implement error handling and fallbacks
- [ ] Perform unit and integration testing
- [ ] Conduct user flow testing
- [ ] Optimize performance and fix bugs

### Phase 5: Deployment and Launch

- [ ] Set up production environment
- [ ] Deploy backend services
- [ ] Deploy frontend application
- [ ] Configure monitoring and logging
- [ ] Perform final testing in production environment

## Technical Stack (Confirmed)

- **Frontend**: React with Next.js, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB for MVP simplicity
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
