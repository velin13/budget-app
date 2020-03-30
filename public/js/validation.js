const passwordCheck = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9]{8,}$/

function validateSignup(event) {
    var form = document.getElementsByName('signupForm')[0];
    if (!(form.pre_password.value === form.password.value)) {
        document.getElementById('error').innerText = 'Oops! Passwords are not the same!'
        event.preventDefault();
    } else if (!Boolean(passwordCheck.exec(form.password.value))) {
        document.getElementById('error').innerText = 'Password needs at least 1 digit and atleast 8 charcters'
        event.preventDefault();
    }
}