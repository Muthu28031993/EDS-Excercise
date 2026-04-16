export default function decorate(block) {
  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    const parentElement = block.parentElement.parentElement;
    const textElement = block.children[0].children[0];
    textElement.classList.add('transpo-quote-text');
    if (img && img.src) {
      parentElement.style.backgroundImage = `url('${img.src}')`;
      parentElement.style.backgroundSize = 'cover';
      parentElement.style.backgroundPosition = 'center';
      parentElement.style.backgroundRepeat = 'no-repeat';
    }
    picture.parentElement.remove();
  }
}
