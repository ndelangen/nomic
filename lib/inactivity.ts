export function formatTimeRemaining(secondsRemaining: number): string {
  if (secondsRemaining <= 0) {
    return '**⚠️ Time expired!**';
  }

  const days = Math.floor(secondsRemaining / (24 * 60 * 60));
  const hours = Math.floor((secondsRemaining % (24 * 60 * 60)) / (60 * 60));

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }

  if (parts.length === 0) {
    return 'Less than an hour';
  }

  return parts.join(' and ');
}
