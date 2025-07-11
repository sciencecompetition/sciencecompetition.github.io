import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase, ref, set, get, query, orderByKey, startAt, endAt } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const API_key = window.firebase_API_key;
const firebaseConfig = {
  apiKey: API_key,
  authDomain: "food-waste-record.firebaseapp.com",
  databaseURL: "https://food-waste-record-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "food-waste-record",
  storageBucket: "food-waste-record.firebasestorage.app",
  messagingSenderId: "891094328182",
  appId: "1:891094328182:web:18d1c293b282324dabd057",
  measurementId: "G-M6WWZ0CR05"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app)

export function changeData(location,data) {
    let set_ref = ref(db,location);
    set(set_ref,data);
}
export async function getData(location) {
    let get_ref = ref(db,location);
    let return_data;
    return_data = await get(get_ref);
    if (return_data.exists()) {
        return {"data":return_data.val(),"Status":true};
    } else {
        return {"Status":false};
    }
}

export async function getDataList(type, start_num, end_num) {
    const getList_ref = ref(db,type) // type is the food type, start_num and end_num are dates
    const getList_query = query(getList_ref, orderByKey(), startAt(start_num), endAt(end_num))
    const snapshot = await get(getList_query)
    let return_list = [];
    snapshot.forEach((data) => {
        return_list.push(data.val());
    })
    return return_list;
}