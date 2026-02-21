const nav_bar = document.getElementById('nav_bar');
let window_height = window.innerHeight;

nav_bar.style.height = window_height / 8 + "px";

window.addEventListener ('resize', () => {
    window_height = window.innerHeight;
    nav_bar.style.height = window_height / 8 + 'px';
})
