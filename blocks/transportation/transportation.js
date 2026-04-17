export default function decorate(block) {
  // Find the closest section with the transportation-container class
  const section = block.closest('.section.transportation-container');
  if (!section) return;

  // Find the first img inside the block
  const img = block.querySelector('img');
  if (img && img.src) {
    section.style.backgroundImage = `url('${img.src}')`;
    section.style.backgroundSize = 'cover';
    section.style.backgroundPosition = 'center';
    section.style.backgroundRepeat = 'no-repeat';
  }
  img.parentElement.parentElement.remove();
}