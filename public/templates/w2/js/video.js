/**
 * BRUVA Coffee - High Performance Video Controller
 * Handles muted autoplay, IntersectionObserver playback management, and low-power fallbacks.
 */

export function initVideoController() {
  const videos = document.querySelectorAll('video');

  if (!videos.length) return;

  // 1. Initial configuration & resilient autoplay
  videos.forEach((video) => {
    video.muted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.playsInline = true;

    // Check if autoplay succeeded
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay policy prevented playback until interaction
        console.warn('Autoplay deferred for:', video.id || video.src, err);
        const onFirstInteraction = () => {
          video.play().catch(() => {});
          window.removeEventListener('click', onFirstInteraction);
          window.removeEventListener('touchstart', onFirstInteraction);
          window.removeEventListener('scroll', onFirstInteraction);
        };
        window.addEventListener('click', onFirstInteraction, { once: true });
        window.addEventListener('touchstart', onFirstInteraction, { once: true });
        window.addEventListener('scroll', onFirstInteraction, { once: true });
      });
    }
  });

  // 2. IntersectionObserver to play only in-view videos (saves CPU & GPU memory)
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            if (video.paused) {
              video.play().catch(() => {});
            }
          } else {
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      {
        rootMargin: '100px 0px 100px 0px',
        threshold: 0.15,
      }
    );

    videos.forEach((video) => {
      // Don't pause hero immediately on load if near top
      videoObserver.observe(video);
    });
  }

  // 3. Click-to-toggle play/pause for interactive exploration
  const mediaContainers = document.querySelectorAll('.cinematic-media-container');
  mediaContainers.forEach((container) => {
    const video = container.querySelector('video');
    if (!video) return;

    container.addEventListener('click', () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  });
}
