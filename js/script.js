document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const identifier = document.getElementById("loginIdentifier");
  const password = document.getElementById("loginPassword");
  const message = document.getElementById("loginMessage");

  if (!form || !identifier || !password || !message) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loginValue = identifier.value.trim();
    const passwordValue = password.value;

    if (!loginValue || !passwordValue) {
      message.textContent = "Please fill in your login details.";
      message.style.color = "#fff";
      return;
    }

    try {
      const response = await fetch("php/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier: loginValue,
          password: passwordValue
        })
      });

      const result = await response.json();

      if (!result.success) {
        message.textContent = result.message;
        message.style.color = "#fff";
        return;
      }

      localStorage.setItem("ksignCurrentUser", JSON.stringify(result.user));

      if (result.user.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } catch (error) {
      message.textContent = "Something went wrong. Please try again.";
      message.style.color = "#fff";
      console.error(error);
    }
  });
});