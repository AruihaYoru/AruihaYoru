document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('.image img');
  images.forEach(img => {
    const link = document.createElement('a');
    link.href = img.src;
    link.className = 'luminous';
    link.appendChild(img.cloneNode());
    img.parentNode.replaceChild(link, img);
    new Luminous(link);
  });
});
