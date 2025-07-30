import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const username_input = document.getElementById("username")
const password_input = document.getElementById("password")
const error_div = document.querySelector(".error_div")
const error_message = document.querySelector(".error_message")
const sign_up_btn = document.getElementById("sign_up_btn")
const authorization_div = document.querySelector(".authorization_div")
const authorization_button = document.querySelector(".authorization_button")
let can_signin = false;
const displayName = document.getElementById("suggested_username")

const API_key = window.firebase_API_key;

const firebaseConfig = {
  apiKey: "AIzaSyCYEoyWgcbPsiNFVd30KYjkshD5AgjF9Bk"/*API_key*/,
  authDomain: "food-waste-record.firebaseapp.com",
  databaseURL: "https://food-waste-record-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "food-waste-record",
  storageBucket: "food-waste-record.firebasestorage.app",
  messagingSenderId: "891094328182",
  appId: "1:891094328182:web:18d1c293b282324dabd057",
  measurementId: "G-M6WWZ0CR05"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const error_message_dict = {
  // General Errors
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/invalid-credential': 'Incorrect password or email. Please try again.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',

  // Email/Password Sign-up
  'auth/email-already-in-use': 'This email is already registered. Please login instead.',
  'auth/weak-password': 'Password must include at least 6 characters.',
  'auth/operation-not-allowed': 'Email/password login is not enabled.',

  // Google/Federated Auth
  'auth/unauthorized-domain': 'Login with google is not allowed from this domain.',
  'auth/popup-blocked': 'Popup was blocked. Try a different browser or login with email and password.',
  'auth/popup-closed-by-user': 'Login cancelled by closing popup.',
  'auth/account-exists-with-different-credential': 
    'This email is already linked to another login method.',

  // Token/Session
  'auth/invalid-user-token': 'Session expired. Please login again.',
  'auth/user-token-expired': 'Session expired. Please login again.',
  'auth/null-user': 'No active user session.',

  // Configuration/Network
  'auth/api-key-not-valid': 'Configuration error. Contact support.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/internal-error': 'Server error. Please try again.',

  // Default fallback
  'default': 'Login failed. Please try again.'
};


// Set this BEFORE any sign-in operations
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    // Now you can sign in
    can_signin = true;
  })
  .catch((error) => {
    console.error("Persistence error:", error);
  });

sign_up_btn.addEventListener("click", async () => {
  if (can_signin) {
    if (updateButtonColor()) {
        error_div.style.display = "none"
        const sign_up_respond = await sign_up();
        updateProfile(sign_up_respond["user"],{"displayName":displayName.value})
        if(sign_up_respond["status"]) {
          await sendEmailVerification(auth.currentUser);
          authorization_div.style.display = "block";
        } else {
            sendError(sign_up_respond["error"])
        }
    } else {
        sendError("Please enter your email, password, and username. Password must include at least 6 characters.")
    }
  }
})

async function sign_up() {
    const email = username_input.value;
    const password = password_input.value;
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password)
        return {"status":true,"user":result.user}
    } catch (error) {
        console.log("have error")
        console.log(error)
        console.log(error.code)
        return {"status":false,"error":error.code}
    }
}

function updateButtonColor() {
    const active = username_input.value.length > 0 && password_input.value.length >= 6
    sign_up_btn.style.backgroundColor = active ? "#2e8b57" : "#84c7ae";
    return active;
}

setInterval(updateButtonColor, 10);

sign_up_btn.addEventListener("mouseenter",() => {
    sign_up_btn.style.backgroundColor = updateButtonColor() ? "#5aa37d;" : "#84c7ae";
})

sign_up_btn.addEventListener("mouseleave",() => {
    updateButtonColor();
})

authorization_button.addEventListener("click", () => {
  location.reload();
})

function sendError(error_text) {
    const show_text = error_message_dict[error_text]!= undefined ? error_message_dict[error_text] : error_text
    error_message.innerText = show_text;
    error_div.style.display = "block";
    console.log(error_text)
}

onAuthStateChanged(auth, (user) => {
  if (user.emailVerified) {
    window.location.href = "/page_analysis/analysis.html";
  }
})