document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openProfilePanel");
  const closeBtn = document.getElementById("closeProfilePanel");
  const panel = document.getElementById("profileSidePanel");
  const overlay = document.getElementById("profilePanelOverlay");
  const logoutBtn = document.getElementById("logoutBtn");

  const profileUsername = document.getElementById("profileUsername");
  const profileFullName = document.getElementById("profileFullName");
  const profileEmail = document.getElementById("profileEmail");
  const profileUserId = document.getElementById("profileUserId");
  const profileImage = document.getElementById("profileImage");

  const eventsContainer = document.getElementById("eventsContainer");

  const eventModal = document.getElementById("eventRegisterModal");
  const eventOverlay = document.getElementById("eventModalOverlay");
  const closeEventModal = document.getElementById("closeEventModal");
  const eventForm = document.getElementById("eventRegistrationForm");
  const eventMessage = document.getElementById("eventRegistrationMessage");

  const selectedEventTitle = document.getElementById("selectedEventTitle");
  const selectedEventDate = document.getElementById("selectedEventDate");
  const selectedEventLocation = document.getElementById("selectedEventLocation");

  const eventUsername = document.getElementById("eventUsername");
  const eventFullName = document.getElementById("eventFullName");
  const eventEmail = document.getElementById("eventEmail");
  const eventUserId = document.getElementById("eventUserId");

  let currentUser = null;
  let selectedEventId = "";
  let events = [];

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function getImagePath(path) {
  const fallback = "image/K-Sign Logo.png";

  if (!path) return fallback;

  let cleanPath = String(path).trim().replace(/\\/g, "/");

  if (
    cleanPath.startsWith("http://") ||
    cleanPath.startsWith("https://") ||
    cleanPath.startsWith("data:")
  ) {
    return cleanPath;
  }

  if (/^[A-Za-z]:\//.test(cleanPath)) {
    return fallback;
  }

  cleanPath = cleanPath.replace(/^\/+/, "");

  if (!cleanPath.includes("/")) {
    cleanPath = `image/${cleanPath}`;
  }

  return cleanPath;
 }

  function loadCurrentUser() {
    currentUser = JSON.parse(localStorage.getItem("ksignCurrentUser"));

    if (!currentUser) {
      window.location.href = "login.html";
      return;
    }

    if (profileUsername) {
      profileUsername.textContent = "@" + (currentUser.username || "defaultuser");
    }

    if (profileFullName) {
      profileFullName.textContent =
        currentUser.full_name ||
        currentUser.fullName ||
        `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
        "Default User";
    }

    if (profileEmail) {
      profileEmail.textContent = currentUser.email || "default@email.com";
    }

    if (profileUserId) {
      profileUserId.textContent =
        currentUser.user_id || currentUser.userId || "KS-2026-0000";
    }

    if (profileImage) {
      profileImage.src =
        currentUser.profile_image ||
        currentUser.profileImage ||
        "image/K-Sign Logo.png";

      profileImage.onerror = function () {
        this.src = "image/K-Sign Logo.png";
      };
    }
  }

  function openProfile() {
    if (panel && overlay) {
      panel.classList.add("show");
      overlay.classList.add("show");
    }
  }

  function closeProfile() {
    if (panel && overlay) {
      panel.classList.remove("show");
      overlay.classList.remove("show");
    }
  }

  function openEventRegisterModal(eventId, title, date, location) {
    if (!currentUser) {
      window.location.href = "login.html";
      return;
    }

    selectedEventId = eventId || "";
    selectedEventTitle.textContent = title || "";
    selectedEventDate.textContent = date || "";
    selectedEventLocation.textContent = location || "";

    if (eventForm) eventForm.reset();
    if (eventMessage) eventMessage.textContent = "";

    eventUsername.value = currentUser.username || "defaultuser";
    eventFullName.value =
      currentUser.full_name ||
      currentUser.fullName ||
      `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
    eventEmail.value = currentUser.email || "";
    eventUserId.value = currentUser.user_id || currentUser.userId || "";

    if (eventModal && eventOverlay) {
      eventModal.classList.add("show");
      eventOverlay.classList.add("show");
    }
  }

  function closeEventRegisterModalFunc() {
    if (eventModal) eventModal.classList.remove("show");
    if (eventOverlay) eventOverlay.classList.remove("show");
  }

  function renderEvents() {
    if (!eventsContainer) return;

    if (!events.length) {
      eventsContainer.innerHTML = `
        <div class="col-12 text-center">
          <p>No events available yet.</p>
        </div>
      `;
      return;
    }

    eventsContainer.innerHTML = events
      .map((event) => {
        const badgeClass = event.status === "Soon" || event.status === "Closed" ? "event-badge closed" : "event-badge";
        const buttonText = event.status === "Closed" ? "Closed" : "Register Now";
        const buttonClass = event.status === "Closed"
          ? "event-btn disabled-event-btn"
          : "event-btn register-event-btn";

        return `
          <div class="col-md-6 col-lg-4">
            <div class="event-card">
              <div class="event-image">
                <img src="${getImagePath(event.image)}" alt="${event.title}" class="img-fluid" onerror="this.onerror=null; this.src='image/K-Sign Logo.png'">
                <span class="${badgeClass}">${event.status}</span>
              </div>
              <div class="event-content">
                <h3>${event.title}</h3>
                <p class="event-meta"><i class="fa-solid fa-calendar"></i> ${formatDate(event.event_date)}</p>
                <p class="event-meta"><i class="fa-solid fa-location-dot"></i> ${event.location}</p>
                <p class="event-desc">${event.description}</p>
                <a href="#"
                  class="${buttonClass}"
                  data-event-id="${event.event_id}"
                  data-event-title="${event.title}"
                  data-event-date="${event.event_date}"
                  data-event-location="${event.location}">
                  ${buttonText}
                </a>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    const registerButtons = document.querySelectorAll(".register-event-btn");
    registerButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();

        const eventId = button.getAttribute("data-event-id") || "";
        const title = button.getAttribute("data-event-title") || "";
        const date = button.getAttribute("data-event-date") || "";
        const location = button.getAttribute("data-event-location") || "";

        openEventRegisterModal(eventId, title, date, location);
      });
    });
  }

  async function fetchEvents() {
    try {
      const response = await fetch("php/get_events.php");
      const result = await response.json();

      if (result.success) {
        events = result.events || [];
        renderEvents();
      } else {
        if (eventsContainer) {
          eventsContainer.innerHTML = `<div class="col-12 text-center"><p>Failed to load events.</p></div>`;
        }
      }
    } catch (error) {
      console.error(error);
      if (eventsContainer) {
        eventsContainer.innerHTML = `<div class="col-12 text-center"><p>Something went wrong while loading events.</p></div>`;
      }
    }
  }

  if (openBtn) {
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openProfile();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeProfile);
  }

  if (overlay) {
    overlay.addEventListener("click", closeProfile);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("ksignCurrentUser");
      window.location.href = "login.html";
    });
  }

  if (closeEventModal) {
    closeEventModal.addEventListener("click", closeEventRegisterModalFunc);
  }

  if (eventOverlay) {
    eventOverlay.addEventListener("click", closeEventRegisterModalFunc);
  }

  if (eventForm) {
    eventForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const ticketType = document.getElementById("ticketType").value;
      const attendeesCount = document.getElementById("attendeesCount").value;
      const fanMessage = document.getElementById("fanMessage").value.trim();

      const currentUserId = currentUser.user_id || currentUser.userId || "";
      const currentFullName =
        currentUser.full_name ||
        currentUser.fullName ||
        `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
      const currentEmail = currentUser.email || "";

      if (!ticketType || !attendeesCount) {
        eventMessage.textContent = "Please complete the required fields.";
        eventMessage.style.color = "#d60063";
        return;
      }

      try {
        const response = await fetch("php/submit_registration.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id: currentUserId,
            event_id: selectedEventId,
            event_title: selectedEventTitle.textContent,
            full_name: currentFullName,
            email: currentEmail,
            ticket_type: ticketType,
            attendees_count: Number(attendeesCount),
            fan_message: fanMessage
          })
        });

        const rawText = await response.text();
        console.log("EVENT REGISTRATION RAW RESPONSE:", rawText);

        const result = JSON.parse(rawText);

        if (result.success) {
          eventMessage.textContent = result.message;
          eventMessage.style.color = "green";

          setTimeout(() => {
            closeEventRegisterModalFunc();
            fetchEvents();
          }, 1000);
        } else {
          eventMessage.textContent = result.message || "Registration failed.";
          eventMessage.style.color = "#d60063";
        }
      } catch (error) {
        eventMessage.textContent = "Something went wrong. Please try again.";
        eventMessage.style.color = "#d60063";
        console.error(error);
      }
    });
  }

  loadCurrentUser();
  fetchEvents();
});