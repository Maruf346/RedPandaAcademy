export function encodeProgress(snapshot) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(snapshot))));
}

export function decodeProgress(code) {
  return JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
}
