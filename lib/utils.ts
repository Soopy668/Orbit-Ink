export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function uid() {
  return Math.random().toString(36).slice(2, 11);
}

export function formatTime(value: number) {
  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}
