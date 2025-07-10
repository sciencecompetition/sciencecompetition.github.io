import { getData } from "/firebase.js"

const today_waste_ele = document.querySelector(".strong1");
const raw_date = new Date();
const year = raw_date.getFullYear();
const food_types = ["Chilli","Corn","Meatball"]
let month = raw_date.getMonth()+1;
if (month < 10) {
    month = `0${month}`
}
let day = raw_date.getDate();
if (day < 10) {
    day = `0${day}`
}
const full_date = `${year}${month}${day}`
let waste_dataObject = {};
let total = 0;
Promise.all(
    food_types.map(item =>
        getData(`/${item}/20250626`).then(data => {
            waste_dataObject[item] = data;
        })
    )
).then(() => {
    food_types.forEach((item) => {
        total += waste_dataObject[item]["data"]
    })
    today_waste_ele.innerHTML = total.toString();
});