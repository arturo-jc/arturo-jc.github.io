window.addEventListener('DOMContentLoaded', () => {

  const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

      const id = entry.target.getAttribute('id');

      if (entry.intersectionRatio > 0) {
        document.querySelector(`.post__toc-item[href="#${id}"]`).parentElement.classList.add('active');
      } else {
        document.querySelector(`.post__toc-item[href="#${id}"]`).parentElement.classList.remove('active');
      }

    });
  });

  // Track all sections that have an `id` applied
  document.querySelectorAll('h1[id], h2[id], div[id]').forEach((section) => {
    observer.observe(section);
  });
  
});

window.addEventListener('scroll', () => {
  var element = document.querySelector('.post__toc');
  var threshold = 200; // The scroll threshold you want to use

  var pageOffset = window.pageYOffset;
  if (pageOffset > threshold) {
    var opacity = (pageOffset - threshold) / (window.innerHeight / 2);
    opacity = Math.min(opacity, 1); // Cap the opacity at 1
    element.style.opacity = opacity;
  } else {
    element.style.opacity = 0;
  }
});
