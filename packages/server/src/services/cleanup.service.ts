// Cleanup scheduler — simplified for Discord auth (no email verification or deletion flows)
// Kept as skeleton for future use (e.g., cleaning old rooms)

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

export function startCleanupScheduler() {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  cleanupInterval = setInterval(() => {
    // Future cleanup tasks can be added here
  }, ONE_DAY_MS);
}

export function stopCleanupScheduler() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}
