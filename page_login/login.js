import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const username_input = document.getElementById("username")
const password_input = document.getElementById("password")
const sign_in_btn = document.getElementById("submit")
const google_btn = document.getElementById("google")
const error_div = document.querySelector(".error_div")
const error_message = document.querySelector(".error_message")
const authorization_button = document.querySelector(".authorization_button")
let can_signin = false;
const error_message_dict = {
  // General Errors
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/invalid-credential': 'Incorrect password or email. Please try again.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',

  // Email/Password Sign-up
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password': 'Password must be at least 6 characters.',
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

// Set this BEFORE any sign-in operations
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    // Now you can sign in
    can_signin = true;
  })
  .catch((error) => {
    console.error("Persistence error:", error);
  });

sign_in_btn.addEventListener("click", async ()=> {
  if (can_signin) {
    const sign_in_result = await sign_in();
    if (sign_in_result.status) {
        error_div.style.display = "none";
        if (sign_in_result.user.emailVerified) {
          check_recaptcha();
        } else {
          sendError("Your email address is not authorized. Try to login again after authorizing it.",true)
        }
    } else {
        sendError(sign_in_result.error,false)
    }
  }
})

google_btn.addEventListener("click", async ()=> {
  if (can_signin) {
    const sign_in_result = await google_signin()
    if (sign_in_result.status) {
        window.location.href = '/page_analysis/analysis.html';
    } else {
        sendError(sign_in_result.error,false)
    }
  }
})

async function google_signin() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        return {"status":true,"user":result.user}
    } catch (error) {
        console.error("Google sign-in error:", error);
        return {"status":false,"error":error.code};
    }
}

async function sign_in() {
    const email = username_input.value;
    const password = password_input.value;
    try {
        const result = await signInWithEmailAndPassword(auth, email, password)
        return {"status":true,"user":result.user}
    } catch (error) {
        return {"status":false,"error":error.code}
    }
}

function sendError(error_text,authorizeEmail=false) {
    const show_text = error_message_dict[error_text]!= null ? error_message_dict[error_text] : error_text
    error_message.innerText = show_text;
    error_div.style.display = "block";
    if(!authorizeEmail) {
      authorization_button.classList.add("hide")
    } else {
      authorization_button.classList.remove("hide")
    }
}

authorization_button.addEventListener("click", async () => {
  await sendEmailVerification(auth.currentUser)
  alert("We've sent an authorization email to your mailbox, please check it to authorize your email")
})