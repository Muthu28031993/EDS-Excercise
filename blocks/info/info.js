import { decorateIcons } from '../../scripts/aem.js';

export default function decorate(block) {
  decorateIcons(block);

  const infoSection = block.closest('.info-container');

  if (!infoSection) return;

  const moveBeforeHeader = () => {
    const header = document.querySelector('.header-wrapper');
    if (header) {
      header.before(infoSection);
      return true;
    }
    return false;
  };

  if (moveBeforeHeader()) return;
  const observer = new MutationObserver(() => {
    if (moveBeforeHeader()) {
      observer.disconnect();
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}