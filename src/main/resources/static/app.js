/* =========================================================
   GLOBAL STATE
========================================================= */

let COURSES = [];
let CURRENT_USER = null;

/* =========================================================
   API HELPERS
========================================================= */

async function apiGet(url) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPut(url, body) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiDelete(url) {
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
}

/* =========================================================
   AUTH
========================================================= */

async function login(email, password) {
  const data = await apiPost("/api/auth/login", { email, password });
  CURRENT_USER = { email: data.email };
  updateAuthUI();
}

async function signup(email, password) {
  const data = await apiPost("/api/auth/signup", { email, password });
  CURRENT_USER = { email: data.email };
  updateAuthUI();
}

async function loadCurrentUser() {
  try {
    const user = await apiGet("/api/auth/me");
    CURRENT_USER = user;
  } catch {
    CURRENT_USER = null;
  }
}

function updateAuthUI() {
  const label = document.querySelector(".nav-user-label");
  const logoutBtn = document.querySelector(".btn-logout");

  if (CURRENT_USER) {
    if (label) label.textContent = CURRENT_USER.email;
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    if (label) label.textContent = "";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

function ensureAuth() {
  if (!CURRENT_USER) {
    alert("Please login first");
    return false;
  }
  return true;
}

/* =========================================================
   COURSES
========================================================= */

async function loadCourses() {
  COURSES = await apiGet("/api/courses");
}

function renderCourses(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  COURSES.forEach((c) => {
    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <h3>${c.code}</h3>
      <p>${c.title}</p>
      <p>👨‍🏫 ${c.professorName}</p>
      <p>⭐ ${c.averageRating ?? "—"} (${c.reviewCount})</p>
    `;
    card.onclick = () => {
      window.location.href =
        "course-detail.html?id=" + encodeURIComponent(c.id);
    };
    container.appendChild(card);
  });
}

/* =========================================================
   COURSE DETAIL
========================================================= */

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadCourseDetail() {
  const courseId = getQueryParam("id");
  if (!courseId) return;

  const course = await apiGet(`/api/courses/${courseId}`);
  const reviews = await apiGet(`/api/reviews/course/${courseId}`);

  document.getElementById("course-title").textContent = course.title;
  document.getElementById("course-code").textContent = course.code;
  document.getElementById("course-prof").textContent = course.professorName;
  document.getElementById("course-rating").textContent =
    course.averageRating ?? "—";

  renderReviews(reviews, "course-reviews");
}

async function submitCourseReview(courseId) {
  if (!ensureAuth()) return;

  const rating = Number(document.getElementById("review-rating").value);
  const difficulty = document.getElementById("review-difficulty").value;
  const text = document.getElementById("review-text").value;
  const semester = document.getElementById("review-semester").value;
  const year = document.getElementById("review-year").value;

  await apiPost("/api/reviews", {
    courseId,
    rating,
    difficulty,
    text,
    semester,
    year,
  });

  location.reload();
}

/* =========================================================
   REVIEWS
========================================================= */

function renderReviews(list, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = "<p>No reviews yet</p>";
    return;
  }

  list.forEach((r) => {
    const div = document.createElement("div");
    div.className = "review-item";
    div.innerHTML = `
      <div>
        ⭐ ${r.rating} | ${r.difficulty}
        <small>${r.semester} ${r.year}</small>
      </div>
      <p>${r.text}</p>
      ${
        CURRENT_USER && CURRENT_USER.email === r.authorEmail
          ? `<button onclick="deleteReview(${r.id})">Delete</button>`
          : ""
      }
    `;
    container.appendChild(div);
  });
}

async function deleteReview(reviewId) {
  if (!ensureAuth()) return;
  await apiDelete(`/api/reviews/${reviewId}`);
  location.reload();
}

/* =========================================================
   PROFESSORS
========================================================= */

async function loadProfessorDetail() {
  const id = getQueryParam("id");
  if (!id) return;

  const prof = await apiGet(`/api/professors/${id}`);
  const reviews = await apiGet(`/api/reviews/professor/${id}`);

  document.getElementById("prof-name").textContent = prof.name;
  document.getElementById("prof-rating").textContent =
    prof.averageRating ?? "—";

  renderReviews(reviews, "prof-reviews");
}

/* =========================================================
   PAGE BOOTSTRAP
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  await loadCurrentUser();
  updateAuthUI();

  if (document.getElementById("courses-grid")) {
    await loadCourses();
    renderCourses("courses-grid");
  }

  if (document.getElementById("course-detail-page")) {
    await loadCourseDetail();
  }

  if (document.getElementById("professor-detail-page")) {
    await loadProfessorDetail();
  }
});
