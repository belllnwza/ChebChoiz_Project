const LOGIN_PAGE_URL = "ChebChoiz_login.html";
const FORM_FIELDS    = ['username', 'new_password', 'password'];

const arrowButton    = document.querySelector('.Arrow');
if (arrowButton) 
{
    arrowButton.addEventListener('click', function () 
    {
        window.location.href = LOGIN_PAGE_URL;
    }) ;
    arrowButton.style.cursor = 'pointer';
}

const resetForm = document.querySelector('form');
if (resetForm) 
{
    resetForm.addEventListener('submit', async function (event) 
    {
        event.preventDefault();

        if (validateForm()) 
        {
            const username    = document.getElementById('username').value.trim();
            const newPassword = document.getElementById('new_password').value.trim();

            try 
            {
                const response = await fetch('http://localhost:3000/api/reset-password', 
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username, new_password: newPassword })
                });

                const result = await response.json();

                if (result.success) 
                {
                    alert('Password reset successful! Please login with your new password.');
                    window.location.href = LOGIN_PAGE_URL;
                } 
                else 
                {
                    alert('An error occurred: ' + result.message);
                }
            } 
            catch (error) 
            {
                console.error('Error:', error);
                alert('An error occurred connecting to the server.');
            }
        }
    });
}

function validateForm() 
{
    let isValid = true;
    const newPassword     = document.getElementById('new_password').value.trim();
    const confirmPassword = document.getElementById('password').value.trim();

    FORM_FIELDS.forEach(fieldId => 
    {
        const inputField = document.getElementById(fieldId);
        if (inputField && inputField.value.trim() === '') 
        {
            isValid = false;
            inputField.style.border = '2px solid red';
        } 
        else if (inputField) 
        {
            inputField.style.border = 'none';
        }
    });

    const confirmInput = document.getElementById('password');

    if (isValid && newPassword !== confirmPassword) 
    {
        isValid = false;

        document.getElementById('new_password').style.border = '2px solid orange';
        confirmInput.style.border = '2px solid orange';
        alert('The new password does not match the confirmed password. Please check again.');
        return false;
    } 
    else if (newPassword === confirmPassword && newPassword !== '') 
    {
        document.getElementById('new_password').style.border = 'none';
        confirmInput.style.border = 'none';
    }

    if (!isValid) 
    {
        alert('Please fill in all the required fields!');
        return false;
    }

    return isValid;
}

const passwordInput     = document.getElementById('password')       ;
const togglePassword    = document.getElementById('togglePassword') ;
const eyeIcon           = togglePassword.querySelector('img')       ;

const toggleNewPassword = document.getElementById('toggleNewPassword') ;
const NewpasswordInput  = document.getElementById('new_password')       ;
const NeweyeIcon        = toggleNewPassword.querySelector('img')       ;

const CLOSED_EYE_SRC    = "img/close_eye.png" ;
const OPEN_EYE_SRC      = "img/open_eye.png"  ;


toggleNewPassword.addEventListener('click', function () 
{

    const isPassword = NewpasswordInput.getAttribute('type') === 'password' ;

    if (isPassword) 
    {
        NewpasswordInput.setAttribute('type', 'text') ;
        NeweyeIcon.src = OPEN_EYE_SRC                 ;
    } 
    else 
    {
        NewpasswordInput.setAttribute('type', 'password') ;
        NeweyeIcon.src = CLOSED_EYE_SRC                   ;
    }
}) ;

togglePassword.addEventListener('click', function () 
{

    const isPassword = passwordInput.getAttribute('type') === 'password' ;

    if (isPassword) 
    {
        passwordInput.setAttribute('type', 'text') ;
        eyeIcon.src = OPEN_EYE_SRC                 ;
    } 
    else 
    {
        passwordInput.setAttribute('type', 'password') ;
        eyeIcon.src = CLOSED_EYE_SRC                   ;
    }
}) ;