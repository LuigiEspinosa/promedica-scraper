import sanitizeHtml from 'sanitize-html';

export default function sanitize(html) {
  const options = {
    allowedTags: ['a', 'img', 'iframe', 'br'],
    allowedAttributes: {
      a: ['href', 'target'],
      img: ['src', 'alt'],
      iframe: ['src'],
    },
    selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
    allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel', 'data'],
    allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  };

  const clean = sanitizeHtml(html, options)
    .replace(/(?:\t){1,}/g, '')
    .replace(/(?:\r\n|\r|\n){1,}/g, '<br />')
    .replaceAll('"', `'`)
    .trim();

  return clean;
}
