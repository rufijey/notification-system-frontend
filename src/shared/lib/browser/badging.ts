let originalTitle = document.title;
let blinkInterval: ReturnType<typeof setInterval> | null = null;

export const updateAppBadge = (count: number) => {
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }

  if (count > 0) {
    let showCount = true;
    document.title = `${count} new notifications`;

    blinkInterval = setInterval(() => {
      document.title = showCount
        ? originalTitle
        : `${count} new notifications`;
      showCount = !showCount;
    }, 1500);
  } else {
    document.title = originalTitle;
  }

  if ('setAppBadge' in navigator) {
    if (count > 0) {
      (navigator as any).setAppBadge(count).catch(() => { });
    } else {
      (navigator as any).clearAppBadge().catch(() => { });
    }
  }
};

export const clearAppBadge = () => {
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }
  document.title = originalTitle;
  if ('clearAppBadge' in navigator) {
    (navigator as any).clearAppBadge().catch(() => { });
  }
};
