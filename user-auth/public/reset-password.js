// Toggle visibility of passwords
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
        const inputId = button.getAttribute('data-input');
        const input = document.getElementById(inputId);
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        button.textContent = type === 'password' ? 'Show' : 'Hide';
    });
});

document.getElementById('reset-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const email = localStorage.getItem('email');  // Retrieve email from localStorage
    const message = document.getElementById('message');
    const errorMessage = document.getElementById('password-error');

    if (!email) {
        message.textContent = 'Error: Email not found. Please try the password reset process again.';
        return;
    }

    // Continue with password validation and submission logic
    try {
        const response = await fetch('/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword })
        });

        const result = await response.json();

        if (response.status === 409) {
            message.textContent = result.message;  // Old password match message
        } else if (response.ok) {
            alert(result.message);  // Success message
            window.location.href = '/signin.html';  // Redirect to sign-in
        } else {
            throw new Error(result.message || 'Failed to reset password.');
        }
    } catch (error) {
        console.error('Error:', error);
        message.textContent = error.message;
    }
});

