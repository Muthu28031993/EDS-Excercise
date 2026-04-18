
export default function decorate(block) {
  [...block.children].forEach((child) => {
    child.classList.add('expert-content');
    const card = child.querySelector('div');
    if (card) {
      card.classList.add('expert-card');
    }
  });
}