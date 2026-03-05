document.addEventListener('DOMContentLoaded', async function() {
    await Cozy.parseAll();

    const images = document.querySelectorAll('.image img');
    
    images.forEach(img => {
        const link = document.createElement('a');
        
        link.href = img.src; 
        link.className = 'luminous';
        
        const caption = img.closest('.image')?.getAttribute('data-caption');
        
        const newImg = img.cloneNode();
        link.appendChild(newImg);
        img.parentNode.replaceChild(link, img);

        new Luminous(link, {
            caption: caption
        });
    });
});