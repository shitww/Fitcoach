export function extractProps(file: { path: string; content: string }): string[] {
  const props: string[] = [];

  const interfaceMatches = file.content.matchAll(/interface\s+\w+Props\s*\{/g);
  for (const m of interfaceMatches) {
    let depth = 1;
    let i = m.index + m[0].length;
    let body = '';
    while (i < file.content.length && depth > 0) {
      const ch = file.content[i];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      if (depth > 0) body += ch;
      i++;
    }
    const fields = body.matchAll(/\b(\w+)\s*[:?]/g);
    for (const f of fields) props.push(f[1]);
  }

  const typeMatches = file.content.matchAll(/type\s+\w+Props\s*=\s*\{/g);
  for (const m of typeMatches) {
    let depth = 1;
    let i = m.index + m[0].length;
    let body = '';
    while (i < file.content.length && depth > 0) {
      const ch = file.content[i];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      if (depth > 0) body += ch;
      i++;
    }
    const fields = body.matchAll(/\b(\w+)\s*[:?]/g);
    for (const f of fields) props.push(f[1]);
  }

  const simpleTypeMatches = file.content.matchAll(/type\s+Props\s*=\s*\{/g);
  for (const m of simpleTypeMatches) {
    let depth = 1;
    let i = m.index + m[0].length;
    let body = '';
    while (i < file.content.length && depth > 0) {
      const ch = file.content[i];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      if (depth > 0) body += ch;
      i++;
    }
    const fields = body.matchAll(/\b(\w+)\s*[:?]/g);
    for (const f of fields) props.push(f[1]);
  }

  const inlineMatches = file.content.matchAll(/(?:function|const)\s+[A-Z]\w*\s*\(\s*\{\s*([^}]+?)\s*\}\s*:/g);
  for (const m of inlineMatches) {
    const body = m[1];
    const fields = body.matchAll(/\b(\w+)[,?:]/g);
    for (const f of fields) props.push(f[1]);
  }

  return [...new Set(props)];
}
