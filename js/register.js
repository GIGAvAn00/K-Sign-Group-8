document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const message = document.getElementById("registerMessage");

  if (!form || !message) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName")?.value.trim();
    const lastName = document.getElementById("lastName")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;
    const terms = document.getElementById("terms")?.checked;

    if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
      message.textContent = "Please fill in all fields.";
      message.style.color = "#ffd1e8";
      return;
    }

    if (password !== confirmPassword) {
      message.textContent = "Passwords do not match.";
      message.style.color = "#ffd1e8";
      return;
    }

    try {
      const response = await fetch("php/register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          username,
          password
        })
      });

      const rawText = await response.text();
      console.log("REGISTER RAW RESPONSE:", rawText);

      let result;
      try {
        result = JSON.parse(rawText);
      } catch (err) {
        message.textContent = "Invalid server response. Check console.";
        message.style.color = "#ffd1e8";
        return;
      }

      if (result.success) {
        message.textContent = result.message;
        message.style.color = "#ffffff";
        form.reset();

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);
      } else {
        message.textContent = result.message || "Registration failed.";
        message.style.color = "#ffd1e8";
        console.log(result.error || "No extra error details.");
      }
    } catch (error) {
      message.textContent = "Something went wrong. Please try again.";
      message.style.color = "#ffd1e8";
      console.error(error);
    }
  });
});