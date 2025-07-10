import { getData } from "/firebase.js";

function stringifyDate(date) {
    const year = date.getFullYear();
    let month = date.getMonth()+1;
    if (month < 10) {
        month = `0${month}`
    }
    let day = date.getDate();
    if (day < 10) {
        day = `0${day}`
    }
    return `${year}${month}${day}`
}

const raw_date = new Date();
const full_date = 20250626 //stringifyDate(raw_date)
const queryParameters = new URLSearchParams(window.location.search);
const food_type = queryParameters.get('food');
const title_ele = document.getElementById("title");
const photo = document.querySelector(".foodimg");
const waste_today_ele = document.getElementById("waste_today");
const waste_total_ele = document.getElementById("waste_total")
title_ele.innerText = food_type;
photo.src = `/image_sources/${food_type}.png`

getData(food_type).then( (return_value) => {
    let data_Object = return_value["data"]
    waste_today_ele.innerHTML = data_Object[full_date]
    let data_list = [];
    Object.values(data_Object).forEach((value) => {
        data_list.push(value);
    })
    data_list.reverse();
    console.log(data_list)
    let data_sum = calculateSum(data_list);
    waste_total_ele.innerText = data_sum
    document.getElementById("daily_now").innerText = `Today: ${data_Object[full_date]} kg `
    document.getElementById("daily_difference").innerText = Math.round((data_list[0]-data_list[1])*100)/100;
    getData(`${food_type}_buy/${full_date}`).then((buy_data) => {
        document.getElementById("daily_ratio").innerText = `${Math.round((data_list[0]/(data_list[0]+buy_data["data"]))*10000)/100}%`
    })
} )

function calculateSum(list) {
    let sum = 0;
    list.forEach((number)=> {
        sum+=number;
    })
    return Math.round(sum*100)/100;
}

//handle jumping and home button
document.getElementById('homeBtn').onclick = function() {
    window.location.href = '/page_analysis/analysis.html';
};  
["daily","weekly","monthly"].forEach((item) => {
    document.getElementById(`${item}_btn`).onclick = () => {
    window.location.href = `food.html?food=${food_type}#${item}`
} })