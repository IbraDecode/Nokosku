export async function copyText(text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
