/**
 * Helper to replace template placeholders securely
 */
export function renderEmailTemplate({
  template,
  recipientEmail,
  recipientName,
  productName = "OurStory",
  productUrl = "https://ourstory.app",
}: {
  template: string;
  recipientEmail: string;
  recipientName?: string | null;
  productName?: string;
  productUrl?: string;
}): string {
  if (!template) return "";

  const hasName = Boolean(recipientName && recipientName.trim().length > 0);
  const nameVal = hasName ? escapeHtml((recipientName as string).trim()) : "";

  let rendered = template;

  if (!hasName) {
    // If no name is provided, replace greetings like "Hi {{name}}," cleanly with "Hi,"
    rendered = rendered.replace(/Hi\s+\{\{\s*name\s*\}\}/gi, "Hi");
    rendered = rendered.replace(/Hello\s+\{\{\s*name\s*\}\}/gi, "Hello");
    rendered = rendered.replace(/Hey\s+\{\{\s*name\s*\}\}/gi, "Hey");
    rendered = rendered.replace(/\{\{\s*name\s*\}\}/gi, "");
  } else {
    rendered = rendered.replace(/\{\{\s*name\s*\}\}/gi, nameVal);
  }

  rendered = rendered.replace(/\{\{\s*email\s*\}\}/gi, escapeHtml(recipientEmail));
  rendered = rendered.replace(/\{\{\s*product_name\s*\}\}/gi, escapeHtml(productName || "OurStory"));
  rendered = rendered.replace(/\{\{\s*product_url\s*\}\}/gi, escapeHtml(productUrl || "https://ourstory.app"));

  // Clean up any potential double spaces before commas
  rendered = rendered.replace(/\s+,/g, ",");

  return rendered;
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates template for unclosed curly braces or invalid variable syntax
 */
export function validateTemplate(template: string): { valid: boolean; warning?: string } {
  if (!template || !template.trim()) {
    return { valid: false, warning: "Template content cannot be empty." };
  }

  const unclosed = (template.match(/\{\{[^}]*$/g) || []).length;
  if (unclosed > 0) {
    return { valid: false, warning: "Template contains unclosed placeholder tags like '{{'." };
  }

  return { valid: true };
}
