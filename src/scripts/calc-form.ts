// Small DOM helpers shared by calculator page scripts (new calculators; the approved BMI script is unchanged).

export function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

/** Short spoken summary in a polite live region. Cleared first so a repeated identical message is announced again. */
export function announce(regionId: string, message: string): void {
  const region = el(regionId);
  region.textContent = '';
  window.setTimeout(() => {
    region.textContent = message;
  }, 50);
}
