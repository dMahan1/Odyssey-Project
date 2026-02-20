const logo =  document.getElementById('logo');
const block = document.getElementById('signin_background');
let logo_width = logo.offsetWidth;
let logo_height = logo.offsetHeight;

block.style.width = logo_width + 'px';
block.style.height = 3 * logo_height + 'px';

window.addEventListener('resize', () => {
    logo_width = logo.offsetWidth;
    block.style.width = logo_width + 'px';

    logo_height = logo.offsetHeight;
    block.style.height = 3 * logo_height + 'px';
})

