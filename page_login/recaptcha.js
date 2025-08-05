function check_recaptcha() {
    // Check if reCAPTCHA is loaded
        if (typeof grecaptcha === 'undefined') {
            alert("CAPTCHA is still loading. Please wait a moment.");
            return;
        }
        
        const captchaResponse = grecaptcha.getResponse();
        
        if (!captchaResponse.length) {
            alert('Please complete the CAPTCHA!');
            grecaptcha.reset(); // Optional: Reset the CAPTCHA
            return;
        }
        
        // Successful validation → redirect
        window.location.href = '/page_analysis/analysis.html';
}