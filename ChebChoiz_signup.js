const LOGIN_PAGE_URL = "ChebChoiz_login.html"   ;
const FORM_FIELDS    = ['username', 'password'] ;

const arrowButton        = document.querySelector('.Arrow') ;
arrowButton.style.cursor = 'pointer'                        ;

arrowButton.addEventListener('click', function () 
{
    window.location.href = LOGIN_PAGE_URL ;
});


const signupForm = document.querySelector('form') ;

signupForm.addEventListener('submit', async function (event) 
{
    event.preventDefault() ;

    if (validateForm()) 
    {
        const username = document.getElementById('username').value ;
        const password = document.getElementById('password').value ;

        try 
        {
            const response = await fetch('http://localhost:3000/api/register', 
            {
                method  : 'POST',
                headers : { 'Content-Type': 'application/json' },
                body    : JSON.stringify({ username, password })
            }) ;

            const result = await response.json() ;

            if (result.success) 
            {
                alert('Registration successful! Please login with your new account.') ;
                window.location.href = LOGIN_PAGE_URL ;
            } 
            else 
            {
                alert('Account registration failed.') ;
            }
        } 
        catch (error) 
        {
            console.error('Error:', error)                       ;
            alert('An error occurred connecting to the server.') ;
        }
    }
    else 
    {
        alert('Please enter your Username and Password completely!') ;
    }
}) ;

function validateForm() 
{
    let isValid = true ;

    FORM_FIELDS.forEach(fieldId => 
    {
        const inputField = document.getElementById(fieldId) ;

        if (inputField && inputField.value.trim() === '') 
        {
            isValid = false ;

            inputField.style.border = '2px solid red' ;
        }
        else if (inputField) 
        {
            inputField.style.border = 'none' ;
        }
    }) ;

    return isValid ;
}

const passwordInput  = document.getElementById('password')       ;
const togglePassword = document.getElementById('togglePassword') ;
const eyeIcon        = togglePassword.querySelector('img')       ;

const CLOSED_EYE_SRC = "img/close_eye.png" ;
const OPEN_EYE_SRC   = "img/open_eye.png"  ;

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