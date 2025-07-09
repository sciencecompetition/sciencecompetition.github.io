const firebaseConfig = {
    apiKey: "AIzaSyCYEoyWgcbPsiNFVd30KYjkshD5AgjF9Bk",
    authDomain: "food-waste-record.firebaseapp.com",
    databaseURL: "https://food-waste-record-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "food-waste-record",
    storageBucket: "food-waste-record.firebasestorage.app",
    messagingSenderId: "891094328182",
    appId: "1:891094328182:web:18d1c293b282324dabd057",
    measurementId: "G-M6WWZ0CR05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();
function changeData(location,data) {
    let set_ref = ref(db,location);
    set(set_ref,data);
}
async function getData(location) {
    let get_ref = ref(db,location);
    let return_data;
    return_data = await get(get_ref);
    if (return_data.exists()) {
        return {"data":return_data.val(),"Status":true};
    } else {
        return {"Status":false};
    }
} 