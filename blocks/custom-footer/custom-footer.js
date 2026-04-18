export default function decorate(block) {
  const section = block.closest('.section.custom-footer-container');
  if (!section) return;
  if (section) {
    const children = block.children[0].children[0];
    const firstImg = children.querySelector('img');
    if (firstImg) {
      section.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('${firstImg.src}')`;
      section.style.backgroundSize = 'cover';
      section.style.backgroundPosition = 'center';
      section.style.backgroundRepeat = 'no-repeat';
      section.style.position = 'relative';
      section.style.overflow = 'hidden';
      
      block.children[0].remove();
      block.children[0].classList.add('footer-content', 'footer-logo');
      block.children[1].classList.add('footer-content', 'footer-address');
      block.children[2].classList.add('footer-content', 'footer-links');
      block.children[3].classList.add('footer-content', 'footer-gallery');
    }
  }
}
