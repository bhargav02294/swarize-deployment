document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('otp-email');
  const savedEmail = localStorage.getItem('signupEmail');
  if(savedEmail){
    emailInput.value = savedEmail;
    emailInput.readOnly = true;
  }
});

let timer;
let timeLeft = 60;

function startTimer(){
  const timerDisplay = document.getElementById('timer-count');
  const resendButton = document.getElementById('resend-otp');
  document.getElementById('timer').style.display='block';
  resendButton.style.display='none';

  if(timer) clearInterval(timer);
  timeLeft=60;

  timer = setInterval(()=>{
    timeLeft--;
    timerDisplay.textContent = timeLeft<10? `00:0${timeLeft}`:`00:${timeLeft}`;
    if(timeLeft<=0){
      clearInterval(timer);
      resendButton.style.display='block';
      document.getElementById('timer').style.display='none';
    }
  },1000);
}

async function sendOtp(){
  const email = document.getElementById('otp-email').value.trim();
  if(!email) return alert("Email required");

  try{
    const res = await fetch("/api/auth/send-otp", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if(data.success){
      showMessage("success", data.message);
      startTimer();
    } else {
      showMessage("error", data.message);
    }
  }catch(e){
    console.error("Error sending OTP:", e);
    showMessage("error","Failed to send OTP. Check email or internet settings.");
  }
}

async function verifyOtp(){
  const email = document.getElementById('otp-email').value.trim();
  const otp = document.getElementById('otp-email-input').value.trim();
  if(!email || !otp) return showMessage("error","Email and OTP are required.");

  try{
    const res = await fetch("/api/auth/verify-otp", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();
    if(data.success){
      showMessage("success", data.message);
      setTimeout(()=>{ window.location.href="index.html"; }, 2000);
    } else {
      showMessage("error", data.message);
    }
  }catch(e){
    console.error("Error verifying OTP:", e);
    showMessage("error","Error verifying OTP.");
  }
}

document.getElementById('get-otp').addEventListener('click', sendOtp);
document.getElementById('resend-otp').addEventListener('click', sendOtp);
document.getElementById('submit-email-otp').addEventListener('click', verifyOtp);

function showMessage(type, message){
  const container = document.getElementById('message-container');
  const text = document.getElementById('message-text');
  container.className = type === "success"?"message success":"message error";
  text.textContent = message;
  container.style.display="block";
  setTimeout(()=>{ container.style.display="none"; }, 5000);
}
