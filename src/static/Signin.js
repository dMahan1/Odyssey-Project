/* Variables */
const signin_email = document.getElementById('signin_email');
const signin_password = document.getElementById('signin_password');
const signin_button = document.getElementById('signin_button');

const forgot_button = document.getElementById('forgot_button');
/* On run */

signin_email.style.fontSize =
    signin_password.style.fontSize =
    signin_button.style.fontSize =
    forgot_button.style.fontSize =
    height * .175 + "px";

block.style.gap = width * .12 + "px"
sign_here.style.marginTop = -height * .23 + "px"

//forgot_button.style.marginTop = -height * .25 + "px"
forgot_button.style.fontSize = height * .0875 +"px"

window.addEventListener('resize', () => {
    // signin adjustments
    signin_email.style.fontSize =
        signin_password.style.fontSize =
        signin_button.style.fontSize =
        forgot_button.style.fontSize =
        height * .175 + "px";

    block.style.gap = width * .12 + "px"
    sign_here.style.marginTop = -height * .23 + "px"

    //forgot_button.style.marginTop = -height * .25 + "px"
    forgot_button.style.fontSize = height * .0875 +"px"
})

forgot_button.addEventListener('click', () => {
    socket.emit("reset_password", signin_email.value)
    socket.on("password_reset_sent", (out) => {
        if (out) {
            alert("Reset email sent!")
        } else {
            alert("Reset email failed.")
        }
    })
})
signin_button.addEventListener('click', () =>{
    if (location_success) {
        socket.emit("login", signin_email.value, signin_password.value, longitude, latitude)

        socket.once("auth", (user) => {
            sessionStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('user_backup', JSON.stringify(user));
            setTimeout(() => {
                window.location.href = "Map.html";
            }, 200);
        });

        socket.once("authfail", (result) => {
            const status = result.status;
            if (status === "Invalid") {
                alert("Please enter a valid email");
            } else if (status === "Bad_Pass") {
                alert("Incorrect Password for provided email")
            } else if (status === "NoAccount") {
                alert("No account found for this email. Please sign up.");
            } else {
                alert("Incorrect Email or Password");
            }
        });
    }
    else {
        alert("Please allow location access for this application");
    }
})
