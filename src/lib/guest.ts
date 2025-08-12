export function getGuestId(): string {
  try {
    const key = "guest_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    // Fallback if localStorage is unavailable
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
