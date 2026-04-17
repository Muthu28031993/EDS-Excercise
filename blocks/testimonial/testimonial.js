export default function decorate(block) {
  // Add 'testi-card' class to each immediate child div of the block
  [...block.children].forEach((child) => {
    child.classList.add('testi-card');
    const c = child.children[0];
    c.classList.add('card-content');
    c.children[0].classList.add('testi-icons');
    c.children[1].classList.add('testi-text');
    c.children[2].classList.add('testi-image');
  });
  // Wrap the block in a viewport to mask overflow
  const viewport = document.createElement('div');
  viewport.className = 'testimonial-viewport';
  block.parentElement.insertBefore(viewport, block);
  viewport.appendChild(block);
  // Carousel navigation arrows
  const leftArrow = document.createElement('button');
  leftArrow.className = 'carousel-arrow left-arrow';
  leftArrow.innerHTML = '&#8592;';
  const rightArrow = document.createElement('button');
  rightArrow.className = 'carousel-arrow right-arrow';
  rightArrow.innerHTML = '&#8594;';
  viewport.style.position = 'relative';
  viewport.append(leftArrow, rightArrow);
  let currentIndex = 0,
    cards = [...block.children],
    visible = 3,
    total = cards.length;
  function updateCarousel(animate = true) {
    cards.forEach((card, i) => {
      let offset = i - currentIndex;
      if (offset < -Math.floor(total / 2)) offset += total;
      if (offset > Math.floor(total / 2)) offset -= total;
      if (offset >= 0 && offset < visible) {
        card.style.transform = `translateX(${offset * 100}%) scale(1)`;
        card.style.opacity = 1;
        card.style.zIndex = 2;
        card.style.pointerEvents = 'auto';
      } else {
        card.style.transform = `translateX(${offset * 100}%) scale(0.8)`;
        card.style.opacity = 0;
        card.style.zIndex = 1;
        card.style.pointerEvents = 'none';
      }
      card.style.transition = animate
        ? 'transform 0.7s cubic-bezier(.77,0,.18,1), opacity 0.5s'
        : 'none';
      card.style.position = 'absolute';
      card.style.left = card.style.top = card.style.right = card.style.bottom = 0;
      card.style.width = 'calc((100% - 40px) / 3)';
    });
    block.style.transform = 'none';
    block.style.position = 'relative';
    block.style.height = cards[0].offsetHeight + 'px';
  }
  block.style.perspective = '1200px';
  block.style.position = 'relative';
  block.style.height = cards[0].offsetHeight + 'px';
  block.style.display = 'block';
  rightArrow.onclick = () => {
    currentIndex = (currentIndex + 1) % total;
    updateCarousel(true);
  };
  leftArrow.onclick = () => {
    currentIndex = (currentIndex - 1 + total) % total;
    updateCarousel(true);
  };
  updateCarousel(false);
}
