const logo =  document.getElementsByClassName('logo')[0];
const block = document.getElementsByClassName('signin_background')[0];
let logo_width = logo.offsetWidth;
block.style.width = logo_width + 'px';

window.addEventListener('resize', () => {
    logo_width = logo.offsetWidth;
    block.style.width = logo_width + 'px';
})

