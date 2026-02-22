// libs/gravatar.ts
export function generateGravatar(name: string) {
    const initials = name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=111111&color=ffffff`;
  }
  