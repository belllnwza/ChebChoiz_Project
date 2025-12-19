const MAIN_PAGE_URL            = "ChebChoiz_main.html"   ;
const FORGOT_PASSWORD_PAGE_URL = "ChebChoiz_reset.html"  ;
const SIGNUP_PAGE_URL          = "ChebChoiz_signup.html" ;

const loginForm = document.querySelector('form') ;
loginForm.addEventListener('submit', async function (event) 
{
    event.preventDefault() ;

    const username = document.getElementById('username').value ;
    const password = document.getElementById('password').value ;

    try 
    {
        const response = await fetch('http://localhost:3000/api/login', 
            {
                method  : 'POST',
                headers : { 'Content-Type': 'application/json' },
                body    : JSON.stringify({ username, password })
            });

        const result = await response.json() ;

        if (result.success) 
        {
            localStorage.setItem('userId', result.user.id)     ;
            localStorage.setItem('userName', result.user.name) ;

            alert('Login Successful!')           ;
            window.location.href = MAIN_PAGE_URL ;
        } 
        else 
        {
            alert('Invalid username or password') ;
        }
    } 
    catch (error) 
    {
        console.error('Error:', error)    ;
        alert('Cannot connect to server') ;
    }
}) ;

const forgotPasswordLink = document.querySelector('.forgot-password') ;
forgotPasswordLink.addEventListener('click', function (event) 
{
    event.preventDefault() ;
    window.location.href = FORGOT_PASSWORD_PAGE_URL ;
}) ;

const signupLink = document.querySelector('.signup-link') ;
signupLink.addEventListener('click', function (event) 
{
    event.preventDefault() ;
    window.location.href = SIGNUP_PAGE_URL ;
});

const passwordInput  = document.getElementById('password')        ;
const togglePassword = document.getElementById('togglePassword') ;
const eyeIcon        = togglePassword.querySelector('img')              ;

const OPEN_EYE_SRC   = "img/open_eye.png"    ;
const CLOSED_EYE_SRC = "img/close_eye.png" ;

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