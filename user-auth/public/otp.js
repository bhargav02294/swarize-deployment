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
  const email=document.getElementById('otp-email').value.trim();
  if(!email) return alert("Email required");

  try{
    const res=await fetch("/api/auth/send-otp",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ email })
    });
    const data=await res.json();
    if(data.success){ startTimer(); alert("OTP sent!"); }
    else alert(data.message);
  }catch(e){
    console.error("Error sending OTP:", e);
    alert("Failed to send OTP. Check internet or email settings.");
  }
}

document.getElementById('get-otp').addEventListener('click', sendOtp);
document.getElementById('resend-otp').addEventListener('click', sendOtp);

document.getElementById('submit-email-otp').addEventListener('click', async ()=>{
  const email=document.getElementById('otp-email').value;
  const otp=document.getElementById('otp-email-input').value;

  try{
    const res=await fetch("/api/auth/verify-otp",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ email, otp })
    });
    const data=await res.json();
    if(data.success){ alert("OTP Verified!"); window.location.href="index.html"; }
    else alert(data.message);
  }catch(e){
    console.error("Error verifying OTP:", e);
    alert("Error verifying OTP");
  }
});
