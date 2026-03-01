/* Variables */
const signup_email = document.getElementById('signup_email');
const signup_username = document.getElementById('signup_username');
const signup_password = document.getElementById('signup_password');
const signup_pass_conf = document.getElementById('signup_pass_conf');
const signup_button = document.getElementById('signup_button');

/* On run */
//signup adjustments
signup_email.style.fontSize =
    signup_username.style.fontSize =
    signup_pass_conf.style.fontSize =
    signup_password.style.fontSize =
    signup_button.style.fontSize =
    height * .175 + "px";

block.style.gap = height * .117 + "px"
sign_here.style.marginTop = -height * .0875 +"px"


window.addEventListener('resize', () =>{
    signup_email.style.fontSize =
        signup_username.style.fontSize =
        signup_pass_conf.style.fontSize =
        signup_password.style.fontSize =
        signup_button.style.fontSize =
        height * .175 + "px";

    block.style.gap = height * .117 + "px"
    sign_here.style.marginTop = -height * .0875 +"px"

})

signup_button.addEventListener('click', () =>{
    if (location_success) {
        if (signup_password.value === signup_pass_conf.value) {
            socket.emit("signup", signup_email.value, signup_password.value, signup_username.value, latitude, longitude)
            socket.on("auth", (user) => {
                set_user_data(user);
                window.location.href = "Map.html";
            }); 
        } else {
            alert("Passwords do not match");
        }
    }
    else {
        alert("Please allow location access for this application");
    }
})