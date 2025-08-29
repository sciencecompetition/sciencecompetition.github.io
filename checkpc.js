var userAgent = navigator.userAgent.toLowerCase();
if (userAgent.indexOf('mobile') > -1 || typeof orientation !== 'undefined' && typeof orientation !== 'undefined') {
    alert("This page is designed for desktop use only. Please access it from a desktop computer.");
    window.location.href = "mobile.html";
    document.body.innerHTML = "<h1>Redirecting to mobile version...</h1>";
}