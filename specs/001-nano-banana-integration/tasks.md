# Implementation Tasks: Nano Banana Integration

## Phase 1: Foundation & Setup
- [ ] T001 Update the root `.env` to include `NANO_BANANA_API_KEY`.
- [ ] T002 Review `server/api/` configuration to ensure we can seamlessly add a new route.

## Phase 2: User Story 1 - Create Presentation with Nano Banana [P1]
**Goal**: Integrate Nano Banana as a PPT generation option.
- [ ] T003 [US1] Create `server/services/nanoBananaService.ts` (or `.js`) to handle API interactions (PPT theme generation, Image generation).
- [ ] T004 [US1] Create `server/routes/nanoBanana.ts` to expose the `POST /api/nano-banana/generate` endpoint.
- [ ] T005 [US1] Update backend server entry point to load `nanoBanana` routes.
- [ ] T006 [P] [US1] Update `client/src/lib/api.ts` to include the Nano Banana generation HTTP call.
- [ ] T007 [US1] Create `client/src/components/NanoBananaOptions.tsx` allowing users to select the Nano Banana engine.
- [ ] T008 [US1] Integrate `NanoBananaOptions` into the PPT generation flow in the Frontend user interface.

## Phase 3: User Story 2 - Generate Video Summary from Upload [P2]
**Goal**: Allow uploading files and triggering a Nano Banana video summary job.
- [ ] T009 [US2] Update `server/services/nanoBananaService.ts` to add video job triggering and async polling mechanisms.
- [ ] T010 [US2] Update `server/routes/nanoBanana.ts` to handle the `jobType: "video"` payload format securely.
- [ ] T011 [P] [US2] Create frontend component `client/src/components/VideoPreview.tsx` to handle status polling and video display.
- [ ] T012 [US2] Add the video generation trigger button to the frontend file upload UI.

## Phase 4: Polish & Integration
- [ ] T013 Connect backend Firebase storage logic to store the video returning from Nano Banana safely.
- [ ] T014 End-to-end manual testing of UI using Tailwind adjustments.
