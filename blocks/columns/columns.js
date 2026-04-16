export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
          // Add class to sibling div (before or after)
          const prevDiv = picWrapper.previousElementSibling;
          const nextDiv = picWrapper.nextElementSibling;
          if (prevDiv && prevDiv.tagName === 'DIV' && !prevDiv.classList.contains('columns-img-col')) {
            prevDiv.classList.add('column-text-content');
          } else if (nextDiv && nextDiv.tagName === 'DIV' && !nextDiv.classList.contains('columns-img-col')) {
            nextDiv.classList.add('column-text-content');
          }
        }
      }
    });
  });

  // New logic: Wrap <img> and next 3 siblings in a parent div
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // Find all <img> elements inside <p> tags
      const imgPs = col.querySelectorAll('p > picture > img');
      imgPs.forEach((img) => {
        const p = img.closest('p');
        if (!p) return;
        // Get the next three element siblings after <p>
        let siblings = [];
        let next = p.nextElementSibling;
        while (next && siblings.length < 3) {
          siblings.push(next);
          next = next.nextElementSibling;
        }
        if (siblings.length === 3) {
          // Create a wrapper div
          const wrapper = document.createElement('div');
          wrapper.classList.add('user-content');
          // Insert wrapper before the first element
          p.parentNode.insertBefore(wrapper, p);
          // Move <p> and next 3 siblings into wrapper
          wrapper.appendChild(p);
          siblings.forEach((sib) => {
            wrapper.appendChild(sib);
          });
          // New logic: wrap all <p> tags with only text content in a single div
          const ps = [...wrapper.querySelectorAll('p')];
          const textPs = ps.filter((ptag) => {
            return Array.from(ptag.childNodes).every(
              (node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR')
            );
          });
          if (textPs.length > 0) {
            const textWrapper = document.createElement('div');
            textWrapper.classList.add('user-name');
            // Insert before the first text-only <p>
            textPs[0].parentNode.insertBefore(textWrapper, textPs[0]);
            textPs.forEach((ptag) => {
              textWrapper.appendChild(ptag);
            });
          }
        }
      });
    });
  });
}
