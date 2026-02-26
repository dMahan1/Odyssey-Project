/* Variables */

const logo =  document.getElementById('logo');
const block = document.getElementById('sign_background');
let logo_width = logo.offsetWidth;
let logo_height = logo.offsetHeight;
const sign_here = document.getElementById('sign_here');

/* On Run */

block.style.width = logo_width + 'px';
block.style.height = 3 * logo_height + 'px';

sign_here.style.fontSize = logo_height * .0875 +"px"

// On window resize to adjust
window.addEventListener('resize', () => {
    logo_width = logo.offsetWidth;
    block.style.width = logo_width + 'px';
    logo_height = logo.offsetHeight;
    block.style.height = 3 * logo_height + 'px';

    sign_here.style.fontSize = logo_height * .0875 +"px"

})
