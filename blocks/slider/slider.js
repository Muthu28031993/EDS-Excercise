export default function decorate(block) {
  const slides = block.querySelectorAll(':scope > div');
  slides.forEach((slide) => {
    slide.classList.add('slider-content');
    const card = slide.children[0];
    card.classList.add('slider-card');
    const img = card.querySelector('img');
    if (img) {
      card.style.setProperty('--slider-bg', `url('${img.src}')`);
      img.remove();
    }
  });

  let isDown = false;
  let startX;
  let scrollLeft;
  block.addEventListener('mousedown', (e) => {
    isDown = true;
    block.classList.add('dragging');
    startX = e.pageX - block.offsetLeft;
    scrollLeft = block.scrollLeft;
  });
  block.addEventListener('mouseleave', () => {
    isDown = false;
    block.classList.remove('dragging');
  });
  block.addEventListener('mouseup', () => {
    isDown = false;
    block.classList.remove('dragging');
  });
  block.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - block.offsetLeft;
    const walk = (x - startX) * 4;
    block.scrollLeft = scrollLeft - walk;
  });
}