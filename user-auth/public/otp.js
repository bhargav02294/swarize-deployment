document.addEventListener('DOMContentLoaded', function () {
    const emailInput = document.getElementById('otp-email');
    const savedEmail = localStorage.getItem('signupEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        emailInput.readOnly = true;
    }
});

let timer;
let timeLeft = 60;

function startTimer() {
    const timerDisplay = document.getElementById('timer-count');
    const resendButton = document.getElementById('resend-otp');
    document.getElementById('timer').style.display = 'block';
    resendButton.style.display = 'none';

    if (timer) clearInterval(timer);
    timeLeft = 60;
    timerDisplay.textContent = '01:00';

    timer = setInterval(() => {
        timeLeft--;
        const minutes = String(Math.floor(timeLeft / 60)).padStart(2,'0');
        const seconds = String(timeLeft % 60).padStart(2,'0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
        if(timeLeft <= 0){
            clearInterval(timer);
            resendButton.style.display = 'block';
            document.getElementById('timer').style.display = 'none';
        }
    },1000);
}

function showMessage(type, message){
    const container = document.getElementById('message-container');
    const text = document.getElementById('message-text');
    container.className = type === 'success' ? 'message success' : 'message error';
    text.textContent = message;
    container.style.display = 'block';
    setTimeout(()=> container.style.display='none',5000);
}

function validateEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Send OTP
document.getElementById('get-otp').addEventListener('click', async ()=>{
    const email = document.getElementById('otp-email').value.trim();
    if(!validateEmail(email)) return showMessage("error","Enter a valid email");
    try{
        const res = await fetch("/api/auth/send-otp", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email})
        });
        const data = await res.json();
        if(data.success) { startTimer(); showMessage("success", data.message); }
        else showMessage("error", data.message);
    }catch(err){ console.error(err); showMessage("error","OTP sending failed"); }
});

// Resend OTP
document.getElementById('resend-otp').addEventListener('click', async ()=>{
    const email = document.getElementById('otp-email').value.trim();
    if(!validateEmail(email)) return showMessage("error","Enter a valid email");
    try{
        const res = await fetch("/api/auth/send-otp", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email})
        });
        const data = await res.json();
        if(data.success) { startTimer(); showMessage("success", data.message); }
        else showMessage("error", data.message);
    }catch(err){ console.error(err); showMessage("error","OTP resend failed"); }
});

// Verify OTP
document.getElementById('submit-email-otp').addEventListener('click', async ()=>{
    const email = document.getElementById('otp-email').value.trim();
    const otp = document.getElementById('otp-email-input').value.trim();
    if(!otp) return showMessage("error","Enter OTP");

    try{
        const res = await fetch("/api/auth/verify-otp",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email, otp})
        });
        const data = await res.json();
        if(data.success) { showMessage("success", data.message); setTimeout(()=>window.location.href='index.html',2000); }
        else showMessage("error", data.message);
    }catch(err){ console.error(err); showMessage("error","OTP verification failed"); }
});
