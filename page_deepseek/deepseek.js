const textbox = document.getElementById("user_inputbox");
const submit_btn = document.getElementById("homeBtn");
const chatbox_parent = document.querySelector(".chatbox_parent")
textbox.style.width = (window.innerWidth - 56) + "px";
chatbox_parent.style.height = (window.innerHeight - 263) + "px";

window.addEventListener("resize",() => {
    textbox.style.width = (window.innerWidth - 56) + "px";
})

submit_btn.addEventListener('click', () => {
    window.location.href = '/page_analysis/analysis.html';
})