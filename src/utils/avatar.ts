const AVATAR_COLORS = [
  '#c0392b', '#2980b9', '#27ae60', '#8e44ad',
  '#e67e22', '#16a085', '#d35400', '#2c3e50',
];

const hashId = (id: string | number) => {
  const str = String(id ?? '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const getAvatarColor = (id: string | number) => AVATAR_COLORS[hashId(id) % AVATAR_COLORS.length];

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
