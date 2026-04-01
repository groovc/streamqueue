# Issue #2: Feature — Streaming session management with tier-based limits

## Description

StreamQueue needs to enforce concurrent streaming limits based on subscription tiers. Users should only be able to stream on a limited number of devices simultaneously:

| Tier     | Max Concurrent Streams |
|----------|----------------------|
| Basic    | 1                    |
| Standard | 2                    |
| Premium  | 4                    |

## Requirements

Implement the four functions in `src/services/sessionService.ts`:

### `startSession(userId, contentId, deviceId)`
- Count the user's **active** sessions
- If count >= their tier's limit, throw an error containing `"concurrent stream limit"`
- Otherwise, create a new session with:
  - A UUID as the session ID
  - `active: true`
  - `expires_at` set to `NOW() + sessionTimeoutMinutes` (from config)
- Return the created session

### `heartbeat(sessionId)`
- Update `last_heartbeat` to NOW and extend `expires_at`
- If the session doesn't exist or is inactive, throw an error containing `"not found"`
- Return the updated session

### `endSession(sessionId)`
- Set `active = false` for the session

### `cleanupExpiredSessions()`
- Find all sessions where `active = true` AND `last_heartbeat` is older than `config.sessionTimeoutMinutes`
- Set them to `active = false`
- Return the count of cleaned-up sessions

## Tests

```bash
npm test -- --testPathPattern=sessions
```

All tests in `src/tests/sessions.test.ts` should pass when the implementation is complete.

## Acceptance Criteria

- [ ] All session tests pass
- [ ] Basic users cannot exceed 1 stream
- [ ] Standard users cannot exceed 2 streams
- [ ] Premium users can have up to 4 streams
- [ ] Inactive sessions don't count toward limits
- [ ] Expired sessions are cleaned up correctly
- [ ] Consider: what happens if two "start session" requests race? (Bonus)

## Files to Modify

- `src/services/sessionService.ts` — implement all four functions

## Notes

- The route handlers in `src/routes/sessions.ts` are already wired up. You only need to implement the service layer.
- Subscription tier limits are in `src/config.ts`.
- Session IDs should be UUIDs — the `uuid` package is already installed.
