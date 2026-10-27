const avatarKey = 'yione-self-avatar';
const avatarChanged = 'yione:avatar-changed';

export function readAvatar() {
  try { return localStorage.getItem(avatarKey) || ''; } catch { return ''; }
}

export function subscribeAvatar(callback) {
  window.addEventListener(avatarChanged, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(avatarChanged, callback);
    window.removeEventListener('storage', callback);
  };
}

export async function saveAvatarFile(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('请选择 JPG、PNG 或 WebP 图片');
  }
  if (file.size > 8 * 1024 * 1024) throw new Error('图片不能超过 8 MB');

  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('图片读取失败，请重新选择'));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('当前浏览器无法处理图片');
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 320, 320);
    const value = canvas.toDataURL('image/jpeg', 0.86);
    try { localStorage.setItem(avatarKey, value); }
    catch { throw new Error('头像保存失败，请清理浏览器空间后重试'); }
    window.dispatchEvent(new Event(avatarChanged));
    return value;
  } finally {
    URL.revokeObjectURL(url);
  }
}
