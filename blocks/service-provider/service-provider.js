export default function decorate(block) {
  // Add 'service-card' class to each immediate child of the block
  Array.from(block.children).forEach(child => {
    child.classList.add('service-card');
  });
}