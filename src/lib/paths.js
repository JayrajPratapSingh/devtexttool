// Path-building helpers for the tree navigator.

// JSONPath for accessing `key` from a parent at `parentPath`.
// Numbers become [i]; identifier-safe keys use dot notation; anything else
// uses bracket-quote notation.
export function jsonChildPath(parentPath, key) {
  if (typeof key === "number") return `${parentPath}[${key}]`;
  return /^[A-Za-z_$][\w$]*$/.test(key)
    ? `${parentPath}.${key}`
    : `${parentPath}['${key}']`;
}

// XPath step for an element, adding a positional predicate when it has
// same-named siblings (e.g. /Envelope/Body/Item[2]).
export function xmlChildPath(parentPath, el) {
  const name = el.nodeName;
  const siblings = el.parentNode
    ? Array.from(el.parentNode.children).filter((c) => c.nodeName === name)
    : [name];
  const step =
    siblings.length > 1 ? `${name}[${siblings.indexOf(el) + 1}]` : name;
  return `${parentPath}/${step}`;
}
