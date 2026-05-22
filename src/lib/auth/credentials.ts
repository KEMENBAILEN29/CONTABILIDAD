export function isEmailIdentifier(identifier: string): boolean {
  return identifier.includes("@");
}

export function normalizeCIF(cif: string): string {
  return cif.toUpperCase().trim();
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
