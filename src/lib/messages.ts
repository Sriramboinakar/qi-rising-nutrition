/** Build a wa.me share URL from a template, substituting placeholders. */
export function whatsappShareUrl(template: string, link: string): string {
  const text = template.replace(/\{link\}/g, link).trim();
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Greeting-style share with a client name placeholder. */
export function whatsappGreetingUrl(template: string, name: string): string {
  const text = template.replace(/\{name\}/g, name).trim();
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}