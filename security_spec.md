# Security Spec

## Data Invariants
1. A UserProfile belongs to a user (ownerId == request.auth.uid).
2. A Task belongs to a user (ownerId == request.auth.uid).
3. An AppNotification belongs to a user (ownerId == request.auth.uid).

## Dirty Dozen Payloads
1. UserProfile: Create with mismatched ownerId
2. UserProfile: Update changing ownerId
3. Task: Create missing title
4. Task: Create with string instead of array for subtasks
5. Task: Update changing ownerId
6. Task: Update adding a ghost field (e.g. isAdmin)
7. AppNotification: Create missing ownerId
8. AppNotification: Read by someone who doesn't own it
9. Task: Read by someone who doesn't own it
10. Task: Create with large string ID bypassing size
11. Task: Update createdAt (immutable)
12. UserProfile: Create missing ownerId

## Test Runner (firestore.rules.test.ts)
See next step.
