import { sanitizeChatPlainText } from './sanitize';

describe('sanitizeChatPlainText (segurança XSS / injeção)', () => {
  it('neutraliza tags HTML/script', () => {
    const raw = '<script>alert(1)</script>ola';
    expect(sanitizeChatPlainText(raw)).not.toContain('<script>');
    expect(sanitizeChatPlainText(raw)).toContain('&lt;script&gt;');
  });

  it('neutraliza aspas e barras para contexto HTML', () => {
    expect(sanitizeChatPlainText(`"'/</`)).toContain('&quot;');
    expect(sanitizeChatPlainText(`"'/</`)).toContain('&#x27;');
    expect(sanitizeChatPlainText(`"'/</`)).toContain('&#x2F;');
  });

  it('preserva texto legítimo sem HTML', () => {
    expect(sanitizeChatPlainText('Olá, tudo bem?')).toBe('Olá, tudo bem?');
  });

  it('palavra longa sem espaços permanece uma string (limite é no gateway)', () => {
    const long = 'a'.repeat(200);
    expect(sanitizeChatPlainText(long).length).toBe(200);
  });
});
