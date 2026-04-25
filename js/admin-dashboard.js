document.addEventListener("DOMContentLoaded", () => {
  const eventForm = document.getElementById("eventForm");
  const eventFormMessage = document.getElementById("eventFormMessage");
  const cancelEditBtn = document.getElementById("cancelEditBtn");

  const totalEvents = document.getElementById("totalEvents");
  const totalUsers = document.getElementById("totalUsers");
  const totalRegistrations = document.getElementById("totalRegistrations");
  const upcomingEventsCount = document.getElementById("upcomingEventsCount");
  const totalParticipants = document.getElementById("totalParticipants");
  const mostPopularEvent = document.getElementById("mostPopularEvent");
  const averageParticipants = document.getElementById("averageParticipants");

  const eventsTableBody = document.getElementById("eventsTableBody");
  const registrationsTableBody = document.getElementById("registrationsTableBody");
  const usersTableBody = document.getElementById("usersTableBody");

  const editEventId = document.getElementById("editEventId");
  const eventTitle = document.getElementById("eventTitle");
  const eventDate = document.getElementById("eventDate");
  const eventLocation = document.getElementById("eventLocation");
  const eventStatus = document.getElementById("eventStatus");
  const eventImage = document.getElementById("eventImage");
  const eventDescription = document.getElementById("eventDescription");
  const eventCapacity = document.getElementById("eventCapacity");
  const searchEventInput = document.getElementById("searchEventInput");

  let events = [];
  let users = [];
  let registrations = [];

  const currentUser = JSON.parse(localStorage.getItem("ksignCurrentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    window.location.href = "login.html";
    return;
  }

  function safeText(value) {
    return value ?? "";
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

  function getParticipantCount(eventIdValue) {
    return registrations
      .filter((reg) => reg.event_id === eventIdValue)
      .reduce((sum, reg) => sum + Number(reg.attendees_count || 1), 0);
  }

  async function fetchEvents() {
    const response = await fetch("php/get_events.php");
    const result = await response.json();
    if (result.success) {
      events = result.events || [];
    }
  }

  async function fetchUsers() {
    const response = await fetch("php/get_users.php");
    const result = await response.json();
    if (result.success) {
      users = result.users || [];
    }
  }

  async function fetchRegistrations() {
    const response = await fetch("php/get_registrations.php");
    const result = await response.json();
    if (result.success) {
      registrations = result.registrations || [];
    }
  }

  function renderStats() {
    totalEvents.textContent = events.length;
    totalUsers.textContent = users.length;
    totalRegistrations.textContent = registrations.length;
    upcomingEventsCount.textContent = events.filter((e) => e.status !== "Closed").length;

    const participantTotal = registrations.reduce(
      (sum, reg) => sum + Number(reg.attendees_count || 1),
      0
    );
    totalParticipants.textContent = participantTotal;

    if (averageParticipants) {
      averageParticipants.textContent =
        events.length > 0 ? (participantTotal / events.length).toFixed(1) : "0";
    }

    if (events.length > 0) {
      let popularEvent = "No data yet";
      let highest = -1;

      events.forEach((event) => {
        const count = getParticipantCount(event.event_id);
        if (count > highest) {
          highest = count;
          popularEvent = `${event.title} (${count} participants)`;
        }
      });

      mostPopularEvent.textContent = popularEvent;
    } else {
      mostPopularEvent.textContent = "No data yet";
    }
  }

  function renderEventsTable() {
    const searchValue = searchEventInput ? searchEventInput.value.trim().toLowerCase() : "";

    const filteredEvents = events.filter((event) =>
      event.title.toLowerCase().includes(searchValue)
    );

    if (filteredEvents.length === 0) {
      eventsTableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center">No events found.</td>
        </tr>
      `;
      return;
    }

    eventsTableBody.innerHTML = filteredEvents
      .map((event) => {
        const participants = Number(event.participants || 0);
        const capacity = Number(event.capacity || 0);
        const remaining = Math.max(capacity - participants, 0);

        let remainingClass = "remaining-badge";
        if (remaining === 0) remainingClass += " full";
        else if (remaining <= 10) remainingClass += " low";

        return `
          <tr>
            <td>
              <img 
                src="${getImagePath(event.image)}" 
                alt="${safeText(event.title)}" 
                class="event-thumb"
                onerror="this.onerror=null; this.src='image/K-Sign Logo.png';"
              >
            </td>
            <td>${safeText(event.title)}</td>
            <td>${safeText(event.event_date)}</td>
            <td>${safeText(event.location)}</td>
            <td>
              <span class="status-badge ${
                event.status === "Open"
                  ? "status-open"
                  : event.status === "Soon"
                  ? "status-soon"
                  : "status-closed"
              }">${safeText(event.status)}</span>
            </td>
            <td><span class="capacity-badge">${capacity}</span></td>
            <td>${participants}</td>
            <td><span class="${remainingClass}">${remaining}</span></td>
            <td>
              <button class="table-action-btn btn-edit" onclick="editEvent('${event.event_id}')">Edit</button>
              <button class="table-action-btn btn-delete" onclick="deleteEvent('${event.event_id}')">Delete</button>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  function renderRegistrationsTable() {
    if (registrations.length === 0) {
      registrationsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No registrations found.</td>
        </tr>
      `;
      return;
    }

    registrationsTableBody.innerHTML = registrations
      .map(
        (reg) => `
          <tr>
            <td>${safeText(reg.registration_id)}</td>
            <td>${safeText(reg.event_title)}</td>
            <td>${safeText(reg.full_name)}</td>
            <td>${safeText(reg.email)}</td>
            <td>${safeText(reg.ticket_type)}</td>
            <td>${safeText(reg.attendees_count)}</td>
            <td>${safeText(reg.registered_at)}</td>
          </tr>
        `
      )
      .join("");
  }

  function renderUsersTable() {
    if (users.length === 0) {
      usersTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">No users found.</td>
        </tr>
      `;
      return;
    }

    usersTableBody.innerHTML = users
      .map(
        (user) => `
          <tr>
            <td>${safeText(user.user_id)}</td>
            <td>${safeText(user.username)}</td>
            <td>${safeText(user.full_name)}</td>
            <td>${safeText(user.email)}</td>
            <td>${safeText(user.registered_events)}</td>
          </tr>
        `
      )
      .join("");
  }

  function resetForm() {
    eventForm.reset();
    editEventId.value = "";
    eventFormMessage.textContent = "";
  }

  eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const eventData = {
      event_id: editEventId.value.trim(),
      title: eventTitle.value.trim(),
      event_date: eventDate.value,
      location: eventLocation.value.trim(),
      status: eventStatus.value,
      image: eventImage.value.trim(),
      capacity: Number(eventCapacity.value),
      description: eventDescription.value.trim()
    };

    if (
      !eventData.title ||
      !eventData.event_date ||
      !eventData.location ||
      !eventData.image ||
      !eventData.description ||
      !eventData.capacity
    ) {
      eventFormMessage.textContent = "Please fill in all event fields.";
      eventFormMessage.style.color = "#d63031";
      return;
    }

    try {
      const endpoint = eventData.event_id ? "php/update_event.php" : "php/create_event.php";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(eventData)
      });

      const result = await response.json();

      if (result.success) {
        eventFormMessage.textContent = result.message;
        eventFormMessage.style.color = "green";
        resetForm();
        await loadAll();
      } else {
        eventFormMessage.textContent = result.message || "Failed to save event.";
        eventFormMessage.style.color = "#d63031";
      }
    } catch (error) {
      eventFormMessage.textContent = "Something went wrong.";
      eventFormMessage.style.color = "#d63031";
      console.error(error);
    }
  });

  cancelEditBtn.addEventListener("click", resetForm);

  window.editEvent = function (eventIdValue) {
    const event = events.find((e) => e.event_id === eventIdValue);
    if (!event) return;

    editEventId.value = event.event_id;
    eventTitle.value = event.title;
    eventDate.value = event.event_date;
    eventLocation.value = event.location;
    eventStatus.value = event.status;
    eventImage.value = event.image;
    eventDescription.value = event.description;
    eventCapacity.value = event.capacity || "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.deleteEvent = async function (eventIdValue) {
    const confirmed = confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    try {
      const response = await fetch("php/delete_event.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ event_id: eventIdValue })
      });

      const result = await response.json();

      if (result.success) {
        await loadAll();
      } else {
        alert(result.message || "Failed to delete event.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting.");
    }
  };

  async function loadAll() {
    await Promise.all([fetchEvents(), fetchUsers(), fetchRegistrations()]);
    renderStats();
    renderEventsTable();
    renderRegistrationsTable();
    renderUsersTable();
  }

  if (searchEventInput) {
    searchEventInput.addEventListener("input", renderEventsTable);
  }

  loadAll();
});