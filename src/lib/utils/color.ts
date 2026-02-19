export function darkenHSL(hslString: string, amount = 20): string {
  // Match hsl(h, s%, l%)
  const match = hslString.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);

  if (!match) return hslString;

  let h = parseFloat(match[1]);
  const s = parseFloat(match[2]);
  let l = parseFloat(match[3]);

  l = Math.max(0, l - amount);

  if(h == 0) { 
    return 'hsl(0, 0%, 30%)';
  }

  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function getBorderColor(color: string): string {
  // check: white HSL (0% saturation, 100% lightness)
  if (/hsl\(\d+,\s*0%?,\s*100%?\)/.test(color)) {
    return "hsl(0, 100%, 0%)";
  }
  return darkenHSL(color, 20);
}
