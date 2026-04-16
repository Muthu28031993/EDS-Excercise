export default function decorate(block) {
  Array.from(block.children).forEach((child) => {
    child.classList.add('feedback-card');
    if (child.children.length > 0) {
      if (child.children[0]) child.children[0].classList.add('feedback-icons');
      if (child.children[1]) {
        child.children[1].classList.add('feedback-content');
        if (child.children[1].children[0]) {
          const numElem = child.children[1].children[0];
          numElem.classList.add('feedback-num');
        }
      }
    }
  });

  // Count-up animation logic
  function animateCountUp(elem, target, suffix) {
    let start = 0;
    let duration;
    if (target <= 30) {
      duration = 1800 + target * 20;
    } else {
      duration = Math.max(1200, Math.min(2000, target * 30));
    }
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * target);
      elem.textContent = value + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        elem.textContent = target + suffix;
      }
    }
    requestAnimationFrame(update);
  }

  // Use Intersection Observer to trigger animation
  const nums = block.querySelectorAll('.feedback-num');
  if (nums.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const elem = entry.target;
          const originalText = elem.textContent;
          const match = originalText.match(/(\d+)/);
          if (match) {
            const target = parseInt(match[1], 10);
            const suffix = originalText.slice(match.index + match[1].length) || '';
            animateCountUp(elem, target, suffix);
          }
          obs.unobserve(elem);
        }
      });
    }, { threshold: 0.3 });
    nums.forEach((elem) => observer.observe(elem));
  }
}
