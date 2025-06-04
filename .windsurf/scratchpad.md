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
2. Trend and keyword discovery from YouTube API and Google Trends RSS
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
- [ ]   Integrate YouTube Data API into TrendDiscoveryService for real-time trend fetching
- [ ] Implement LLM Script Generation Service with OpenRouter
- [ ] Set up data models and database connections

### Phase 3: Frontend Development
- [ ] Create responsive UI layout and components
- [ ] Build Script Input Form with validation
- [ ] Develop Trend & Keyword Suggestion Panel
- [ ] Implement AI Script Editor/Display
- [ ] Add action buttons and loading indicators
- [ ] Integrate frontend with backend APIs

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
- **External APIs**: YouTube Data API v3 (key provided), Google Trends (via RSS feed)
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
