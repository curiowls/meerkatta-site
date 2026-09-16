export function playbackIcon(action) {
  const paths = {
    Play: '<path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/>',
    Pause: '<path d="M8 5v14M16 5v14" stroke-width="3"/>',
    Replay: '<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>',
  };
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[action]}</svg>`;
}
