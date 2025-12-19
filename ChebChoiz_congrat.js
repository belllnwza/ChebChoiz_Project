document.addEventListener('DOMContentLoaded', () => 
{
    const mainTitle     = document.querySelector('.main-title');
    const part2Text     = document.querySelector('.congratulations-box .part2');
    const imageFrameImg = document.querySelector('.image-frame img');

    const historyBtn         = document.querySelector('.history-btn');
    const userContainer      = document.querySelector('.image_container');
    const arrowBackContainer = document.querySelector('.Arrow_container');

    const menuName     = localStorage.getItem('chosenMenuName');
    const menuImageSrc = localStorage.getItem('chosenMenuImage');

    if (!menuName) 
    {
        window.location.href = 'ChebChoiz_main.html';
        return;
    }

    if (menuName) 
    {
        if (mainTitle) 
        {
            mainTitle.textContent = menuName;
        }
        if (part2Text) 
        {
            part2Text.textContent = `You chosen : ${menuName}`;
        }
    }

    if (menuImageSrc) 
    {
        if (imageFrameImg) 
        {
            imageFrameImg.src = menuImageSrc;
            imageFrameImg.alt = menuName ;
            imageFrameImg.classList.add('meal-image');
            imageFrameImg.style.display = 'block';
        }
    }

    const handleArrowBackClick = (e) => 
    {
        e.preventDefault();
        window.location.href = 'ChebChoiz_main.html';
    };

    const handleHistoryClick = (e) => 
    {
        e.preventDefault();
        window.location.href = 'ChebChoiz_history.html';
    };

    if (arrowBackContainer) 
    {
        arrowBackContainer.addEventListener('click', handleArrowBackClick);
    }

    if (historyBtn) 
    {
        historyBtn.addEventListener('click', handleHistoryClick);
    }

    if (userContainer) 
    {
        userContainer.addEventListener('click', handleHistoryClick);
    }
});