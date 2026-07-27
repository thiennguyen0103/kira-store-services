const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validate(value: string): boolean {
  return UUID_RE.test(value);
}

export function v7(): string {
  return '01900000-0000-7000-8000-000000000099';
}

export default { validate, v7 };
