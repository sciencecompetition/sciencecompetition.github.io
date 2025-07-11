import { getData, getDataList } from "/firebase.js";

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

const raw_date = new Date("2025-6-26");
const full_date = stringifyDate(raw_date)
const raw_week_ago = new Date(raw_date)
raw_week_ago.setDate(raw_date.getDate()-6)
const week_ago = stringifyDate(raw_week_ago)
const raw_month_ago = new Date(raw_date)
raw_month_ago.setDate(raw_date.getDate()-30)
const month_ago = stringifyDate(raw_month_ago)
const queryParameters = new URLSearchParams(window.location.search);
const food_type = queryParameters.get('food');
const title_ele = document.getElementById("title");
const photo = document.querySelector(".foodimg");
const waste_today_ele = document.getElementById("waste_today");
const waste_total_ele = document.getElementById("waste_total")
title_ele.innerText = food_type;
photo.src = `/image_sources/${food_type}.png`

getData(food_type).then( (return_value) => {
    let data_Object = return_value["data"] //one food all data
    let data_list = [];
    Object.values(data_Object).forEach((value) => {
        data_list.push(value);
    })
    data_list.reverse();
    let data_sum = calculateSum(data_list);
    waste_total_ele.innerText = data_sum
    waste_today_ele.innerText = data_Object[full_date]
    // daily part
    document.getElementById("daily_now").innerText = `Today: ${data_Object[full_date]} kg `
    let daily_difference = round((data_list[0]-data_list[1]));
    let daily_difference_ele = document.getElementById("daily_difference")
    daily_difference_ele.innerText = `(${daily_difference>=0 ? "+" : ""}${daily_difference}kg)`;
    daily_difference_ele.style.color = color(daily_difference)
    getData(`${food_type}_buy/${full_date}`).then((buy_data) => {
        document.getElementById("daily_ratio").innerText = `Waste ratio: ${round(data_list[0]/(data_list[0]+buy_data["data"])*100)}%`
    })
    let daily_average = calculateSum(data_list)/data_list.length;
    document.getElementById("daily_average").innerText = `Average Daily Waste: ${round(daily_average)}kg`
    //

    //weekly part
    let waste_thisweek = calculateSum(data_list.slice(0,7))
    let waste_lastweek = calculateSum(data_list.slice(7,14))
    let weekly_difference_ele = document.getElementById("weekly_difference")
    let weekly_difference = round(waste_thisweek-waste_lastweek)

    document.getElementById("weekly_now").innerText = `This week: ${waste_thisweek}`
    weekly_difference_ele.innerText = `(${weekly_difference>=0 ? "+" : ""}${weekly_difference}kg)`
    weekly_difference_ele.color = color(weekly_difference)
    getDataList(`${food_type}_buy`,week_ago,full_date).then((week_buy) => {
        document.getElementById("weekly_ratio").innerText = `Waste ratio: ${round(waste_thisweek/(waste_thisweek+calculateSum(week_buy)))}`
    })
    document.getElementById("weekly_average").innerText = `Average weekly: ${round(daily_average*7)}`
    //
    
    //monthly part
    let waste_thismonth = calculateSum(data_list.slice(0,30))
    let waste_lastmonth = calculateSum(data_list.slice(30,60))
    let monthly_difference_ele = document.getElementById("monthly_difference")
    let monthly_difference = round(waste_thismonth-waste_lastmonth)

    document.getElementById("monthly_now").innerText = `This month: ${waste_thismonth}`
    monthly_difference_ele.innerText = `(${monthly_difference>=0 ? "+" : ""}${monthly_difference}kg)`
    monthly_difference_ele.color = color(monthly_difference)
    getDataList(`${food_type}_buy`,month_ago,full_date).then((month_buy) => {
        document.getElementById("monthly_ratio").innerText = `Waste ratio: ${round(waste_thismonth/(waste_thismonth+calculateSum(month_buy)))}`
    })
    document.getElementById("monthly_average").innerText = `Average monthly: ${round(daily_average*30)}`
} )

function round(number) {
    return Math.round(number*100)/100
}

function color(difference) {
    return difference > 0 ? "green" : (difference < 0 ? "red" : "#888888")
}

function calculateSum(list) {
    let sum = 0;
    list.forEach((number)=> {
        sum+=number;
    })
    return round(sum);
}

//AI suggestion part
AI_suggestion.ele = document.getElementById("AI_suggestion")
document.getElementById("food_type").innerText = food_type

//handle jumping and home button
document.getElementById('homeBtn').onclick = function() {
    window.location.href = '/page_analysis/analysis.html';
};  
["daily","weekly","monthly"].forEach((item) => {
    document.getElementById(`${item}_btn`).onclick = () => {
    window.location.href = `food.html?food=${food_type}#${item}`
} })