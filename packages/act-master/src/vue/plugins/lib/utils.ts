export function getArguments(fn?: Function): string[] {
  const match = fn?.toString().match(/[^\(]*\(([^\)]*)\)/);
  if (match?.[1]) {
    return match[1].split(',').map((a) => a.trim()).filter(Boolean);
  }
  return [];
}

export function getCurrentTime() {
  // ponytail: toISOString gives HH:MM:SS.mmm in UTC; fine for devtools timestamps
  return new Date().toISOString().slice(11, 23);
}

// ponytail: WeakMap key — fn.toString() collapses under minification
const debounceTimers = new WeakMap<Function, ReturnType<typeof setTimeout>>();

export function debounce(wait: number, func: Function, args?: any) {
  clearTimeout(debounceTimers.get(func));
  debounceTimers.set(func, setTimeout(() => {
    func(args);
    debounceTimers.delete(func);
  }, wait));
}

export function logSettings(type: 'CALL_FILTER', value: any) {
  const title = value ? 'Acts filtered by call' : 'Show all Acts';
  console.log(
    `%c ActMaster 🥷 %c "${title}"\n%c Don\'t forget to update the list %c ⟳ `,
    'background:#44bd90; color:#fff; border-radius: 3px; padding: 3px;',
    value ? 'background:transparent; color:#e56e17;' : 'background:transparent; color:#44bd90;',
    'background:transparent; color:#44bd90;',
    'background:#ffc759; color:#fff; border-radius: 3px; padding: 3px;'
  );
}
