// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// API Helper Functions (Session-based, no JWT)
const api = {
  // Get current user from session
  currentUser: null,

  // Make request with credentials (for session cookies)
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Important: sends session cookie
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Not authenticated
        this.currentUser = null;
        localStorage.removeItem('user_email');
      }
      const errorText = await response.text();
      throw new Error(errorText || `API Error: ${response.status}`);
    }

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
      return null;
    }

    return response.json();
  },

  // Auth endpoints
  async signup(email, password) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.currentUser = { email };
    localStorage.setItem('user_email', email);
    return data;
  },

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.currentUser = { email };
    localStorage.setItem('user_email', email);
    return data;
  },

  async logout() {
    await this.request('/auth/logout', {
      method: 'POST',
    });
    this.currentUser = null;
    localStorage.removeItem('user_email');
  },

  async checkAuth() {
    try {
      const user = await this.request('/auth/current-user');
      this.currentUser = user;
      localStorage.setItem('user_email', user.email);
      return user;
    } catch (error) {
      this.currentUser = null;
      localStorage.removeItem('user_email');
      return null;
    }
  },

  // Course endpoints
  async getAllCourses() {
    return this.request('/courses');
  },

  async getCourseByCode(code) {
    return this.request(`/courses/${encodeURIComponent(code)}`);
  },

  async searchCourses(query) {
    return this.request(`/courses/search?query=${encodeURIComponent(query)}`);
  },

  async getCoursesBySchool(school) {
    return this.request(`/courses/school/${encodeURIComponent(school)}`);
  },

  // Professor endpoints
  async getAllProfessors() {
    return this.request('/professors');
  },

  async getProfessorByName(name) {
    return this.request(`/professors/${encodeURIComponent(name)}`);
  },

  async searchProfessors(query) {
    return this.request(`/professors/search?query=${encodeURIComponent(query)}`);
  },

  async getProfessorById(id) {
    return this.request(`/professors/id/${id}`);
  },

  // Review endpoints
  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  async getReviewsForCourse(courseId) {
    return this.request(`/reviews/course/${courseId}`);
  },

  async getReviewsForProfessor(professorId) {
    return this.request(`/reviews/professor/${professorId}`);
  },

  async updateReview(reviewId, reviewData) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  async deleteReview(reviewId) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },
};

// Utility functions
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || "";
}

function isAuthenticated() {
  return !!api.currentUser;
}

function getCurrentUser() {
  return api.currentUser;
}

function ensureAuthed() {
  if (isAuthenticated()) return true;
  window._openLoginModal?.();
  return false;
}

// Modified Auth Functions
function initAuth() {
  const loginBtn = document.getElementById("btn-login");
  const signupBtn = document.getElementById("btn-signup");

  const authState = { logoutBtn: null, userLabel: null };

  // Build logout UI
  const navAuth = document.querySelector(".nav-auth");
  if (navAuth) {
    authState.userLabel = document.createElement("span");
    authState.userLabel.className = "nav-user-label";
    authState.logoutBtn = document.createElement("button");
    authState.logoutBtn.className = "btn btn-ghost";
    authState.logoutBtn.textContent = "Logout";
    authState.logoutBtn.addEventListener("click", async () => {
      try {
        await api.logout();
        updateAuthUI();
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });
    navAuth.appendChild(authState.userLabel);
    navAuth.appendChild(authState.logoutBtn);
  }

  function updateAuthUI() {
    const user = getCurrentUser();
    const showAuthed = !!user;
    if (loginBtn) loginBtn.style.display = showAuthed ? "none" : "inline-flex";
    if (signupBtn) signupBtn.style.display = showAuthed ? "none" : "inline-flex";
    if (authState.userLabel) {
      authState.userLabel.style.display = showAuthed ? "inline-flex" : "none";
      authState.userLabel.textContent = showAuthed
        ? user.email.replace("@ada.edu.az", "")
        : "";
    }
    if (authState.logoutBtn) {
      authState.logoutBtn.style.display = showAuthed ? "inline-flex" : "none";
    }
  }

  // Check authentication on page load
  api.checkAuth().then(() => {
    updateAuthUI();
  });

  // Add modal HTML
  const authHtml = `
<!-- SIGN UP MODAL -->
<div id="signup-modal" class="review-modal hidden">
  <div class="review-modal-backdrop"></div>
  <div class="review-modal-panel auth-panel">
    <div class="auth-header">
      <div>
        <h3>Join RateMyCourse</h3>
        <p class="modal-subtitle-small">Create an account with your ADA email</p>
      </div>
      <button class="modal-close-btn" id="signup-close">×</button>
    </div>
    <div class="auth-body">
      <form class="auth-form" id="signup-form">
        <label class="auth-label">ADA Email</label>
        <div class="auth-input">
          <span class="auth-icon">✉️</span>
          <input type="email" id="signup-email" placeholder="your.name@ada.edu.az" required />
        </div>
        <small class="auth-hint">Only @ada.edu.az emails are allowed.</small>
        <label class="auth-label">Password</label>
        <div class="auth-input">
          <span class="auth-icon">🔒</span>
          <input type="password" id="signup-password" placeholder="Enter your password" required />
        </div>
        <div id="signup-error" class="auth-error hidden"></div>
        <button type="submit" class="btn btn-primary auth-submit">Create Account</button>
        <div class="auth-bottom-text">
          Already have an account?
          <button type="button" class="auth-link" id="signup-to-login">Sign in</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- LOGIN MODAL -->
<div id="login-modal" class="review-modal hidden">
  <div class="review-modal-backdrop"></div>
  <div class="review-modal-panel auth-panel">
    <div class="auth-header">
      <div>
        <h3>Welcome Back</h3>
        <p class="modal-subtitle-small">Sign in to access your account</p>
      </div>
      <button class="modal-close-btn" id="login-close">×</button>
    </div>
    <div class="auth-body">
      <form class="auth-form" id="login-form">
        <label class="auth-label">Email</label>
        <div class="auth-input">
          <span class="auth-icon">✉️</span>
          <input type="email" id="login-email" placeholder="your.name@ada.edu.az" required />
        </div>
        <label class="auth-label">Password</label>
        <div class="auth-input">
          <span class="auth-icon">🔒</span>
          <input type="password" id="login-password" placeholder="Enter your password" required />
        </div>
        <div id="login-error" class="auth-error hidden"></div>
        <button type="submit" class="btn btn-primary auth-submit">Sign In</button>
        <div class="auth-bottom-text">
          Don't have an account?
          <button type="button" class="auth-link" id="login-to-signup">Sign up</button>
        </div>
      </form>
    </div>
  </div>
</div>
`;

  document.body.insertAdjacentHTML("beforeend", authHtml);

  // Setup modals
  const signupModal = document.getElementById("signup-modal");
  const loginModal = document.getElementById("login-modal");

  function openSignup() {
    const errorEl = document.getElementById("signup-error");
    errorEl.classList.add("hidden");
    document.getElementById("signup-email").value = "";
    document.getElementById("signup-password").value = "";
    signupModal.classList.remove("hidden");
    loginModal.classList.add("hidden");
  }

  function closeSignup() {
    signupModal.classList.add("hidden");
  }

  function openLogin() {
    const errorEl = document.getElementById("login-error");
    errorEl.classList.add("hidden");
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
    loginModal.classList.remove("hidden");
    signupModal.classList.add("hidden");
  }

  function closeLogin() {
    loginModal.classList.add("hidden");
  }

  window._openLoginModal = openLogin;
  window._openSignupModal = openSignup;

  if (signupBtn) signupBtn.addEventListener("click", openSignup);
  if (loginBtn) loginBtn.addEventListener("click", openLogin);

  // Close buttons
  document.getElementById("signup-close")?.addEventListener("click", closeSignup);
  document.getElementById("login-close")?.addEventListener("click", closeLogin);
  signupModal.querySelector(".review-modal-backdrop")?.addEventListener("click", closeSignup);
  loginModal.querySelector(".review-modal-backdrop")?.addEventListener("click", closeLogin);

  // Switch between modals
  document.getElementById("signup-to-login")?.addEventListener("click", openLogin);
  document.getElementById("login-to-signup")?.addEventListener("click", openSignup);

  // Signup form
  document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const errorEl = document.getElementById("signup-error");

    try {
      await api.signup(email, password);
      updateAuthUI();
      closeSignup();
      window.location.reload();
    } catch (error) {
      errorEl.textContent = error.message || "Signup failed";
      errorEl.classList.remove("hidden");
    }
  });

  // Login form
  document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const errorEl = document.getElementById("login-error");

    try {
      await api.login(email, password);
      updateAuthUI();
      closeLogin();
      window.location.reload();
    } catch (error) {
      errorEl.textContent = "Invalid email or password";
      errorEl.classList.remove("hidden");
    }
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initAuth();

  const page = document.body.dataset.page;

  if (page === "home") {
    initHomePage();
  } else if (page === "courses") {
    initCoursesPage();
  } else if (page === "professors") {
    initProfessorsPage();
  } else if (page === "course-detail") {
    initCourseDetailPage();
  } else if (page === "professor-detail") {
    initProfessorDetailPage();
  }
});

// ===== COURSES PAGE IMPLEMENTATION =====

async function initCoursesPage() {
  const searchInput = document.getElementById("courses-search-input");
  const deptFilter = document.getElementById("department-filter");
  const sortSelect = document.getElementById("course-sort");
  const coursesGrid = document.getElementById("courses-grid");
  const coursesCount = document.getElementById("courses-count");

  if (!searchInput || !deptFilter || !sortSelect) return;

  let allCourses = [];
  let loading = true;

  // Show loading state
  coursesGrid.innerHTML = '<p style="text-align:center;">Loading courses...</p>';

  try {
    // Fetch all courses from API
    allCourses = await api.getAllCourses();
    loading = false;
  } catch (error) {
    console.error("Failed to load courses:", error);
    coursesGrid.innerHTML = '<p style="text-align:center;color:red;">Failed to load courses. Please try again.</p>';
    return;
  }

  // Get initial query from URL
  const initialQuery = getQueryParam("query");
  if (initialQuery) {
    searchInput.value = initialQuery;
  }

  function renderCourses() {
    if (loading) return;

    let filtered = [...allCourses];

    // Filter by search query
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.code.toLowerCase().includes(query) ||
          c.professorName.toLowerCase().includes(query)
      );
    }

    // Filter by department/school
    const school = deptFilter.value;
    if (school !== "all") {
      filtered = filtered.filter((c) => c.school === school);
    }

    // Sort courses
    const sortBy = sortSelect.value;
    if (sortBy === "rating-desc") {
      filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === "rating-asc") {
      filtered.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0));
    } else if (sortBy === "reviews-desc") {
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    // Update count label
    coursesCount.textContent = `Showing ${filtered.length} course${
      filtered.length !== 1 ? "s" : ""
    }`;

    // Render course cards
    coursesGrid.innerHTML = "";

    if (filtered.length === 0) {
      coursesGrid.innerHTML = '<p style="text-align:center;color:#666;">No courses found.</p>';
      return;
    }

    filtered.forEach((course) => {
      const card = createCourseCard(course);
      card.classList.add("clickable-card");
      card.addEventListener("click", () => {
        window.location.href = `course-detail.html?code=${encodeURIComponent(course.code)}`;
      });
      coursesGrid.appendChild(card);
    });
  }

  // Event listeners
  searchInput.addEventListener("input", renderCourses);
  deptFilter.addEventListener("change", renderCourses);
  sortSelect.addEventListener("change", renderCourses);

  // Initial render
  renderCourses();
}

// Create course card element
function createCourseCard(course) {
  const div = document.createElement("article");
  div.className = "course-card";

  const hasReviews = course.reviewCount > 0 && course.averageRating != null;
  const ratingDisplay = hasReviews ? course.averageRating.toFixed(1) : "—";
  const starFill = hasReviews
    ? (Math.max(0, Math.min(5, course.averageRating)) / 5) * 100
    : 0;

  const diffLabel = course.difficulty || "";
  const diffClass = diffLabel ? difficultyClass(diffLabel) : "";

  div.innerHTML = `
    <div class="course-meta-top">
      <span class="course-code">${course.code}</span>
      <span>${course.school}</span>
    </div>
    <h3 class="course-title">${course.title}</h3>
    <p class="course-prof">👨‍🏫 ${course.professorName}</p>
    <div class="card-bottom-row">
      <div class="rating">
        <div class="rating-stars-static">
          <div class="rating-stars-bg">★★★★★</div>
          <div class="rating-stars-fill" style="width:${starFill}%;">★★★★★</div>
        </div>
        <span class="rating-score">${ratingDisplay}</span>
      </div>
      ${
        diffLabel
          ? `<span class="difficulty-badge ${diffClass}">${diffLabel}</span>`
          : ""
      }
      <div class="card-comments">
        💬 <span>${course.reviewCount}</span>
      </div>
    </div>
  `;

  return div;
}

function difficultyClass(diff) {
  if (diff === "Easy") return "diff-easy";
  if (diff === "Moderate") return "diff-moderate";
  if (diff === "Hard") return "diff-hard";
  return "";
}

// ===== HOME PAGE =====
function initHomePage() {
  const heroInput = document.getElementById("hero-search-input");
  const heroBtn = document.getElementById("hero-search-btn");

  if (heroBtn && heroInput) {
    heroBtn.addEventListener("click", () => {
      const q = heroInput.value.trim();
      if (q) {
        window.location.href = "courses.html?query=" + encodeURIComponent(q);
      } else {
        window.location.href = "courses.html";
      }
    });

    // Enter key support
    heroInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        heroBtn.click();
      }
    });
  }

  const writeBtn = document.getElementById("home-write-review");
  if (writeBtn) {
    writeBtn.addEventListener("click", () => {
      window.location.href = "courses.html";
    });
  }
}

// ===== PROFESSORS PAGE =====
async function initProfessorsPage() {
  const profSearch = document.getElementById("professors-search-input");
  const profDeptFilter = document.getElementById("prof-department-filter");
  const profSort = document.getElementById("prof-sort");
  const professorsGrid = document.getElementById("professors-grid");
  const professorsCount = document.getElementById("professors-count");

  if (!profSearch || !profDeptFilter || !profSort) return;

  let allProfessors = [];

  professorsGrid.innerHTML = '<p style="text-align:center;">Loading professors...</p>';

  try {
    allProfessors = await api.getAllProfessors();
  } catch (error) {
    console.error("Failed to load professors:", error);
    professorsGrid.innerHTML = '<p style="text-align:center;color:red;">Failed to load professors.</p>';
    return;
  }

  function renderProfessors() {
    let filtered = [...allProfessors];

    const query = profSearch.value.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(query)
      );
    }

    const school = profDeptFilter.value;
    if (school !== "all") {
      filtered = filtered.filter((p) => p.school === school);
    }

    const sortBy = profSort.value;
    if (sortBy === "rating-desc") {
      filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === "rating-asc") {
      filtered.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0));
    } else if (sortBy === "reviews-desc") {
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    professorsCount.textContent = `Showing ${filtered.length} professor${
      filtered.length !== 1 ? "s" : ""
    }`;

    professorsGrid.innerHTML = "";

    if (filtered.length === 0) {
      professorsGrid.innerHTML = '<p style="text-align:center;color:#666;">No professors found.</p>';
      return;
    }

    filtered.forEach((prof) => {
      const card = createProfessorCard(prof);
      card.classList.add("clickable-card");
      card.addEventListener("click", () => {
        window.location.href = `professor-detail.html?name=${encodeURIComponent(prof.name)}`;
      });
      professorsGrid.appendChild(card);
    });
  }

  profSearch.addEventListener("input", renderProfessors);
  profDeptFilter.addEventListener("change", renderProfessors);
  profSort.addEventListener("change", renderProfessors);

  renderProfessors();
}

function createProfessorCard(prof) {
  const div = document.createElement("article");
  div.className = "prof-card";

  const hasReviews = prof.reviewCount > 0 && prof.averageRating != null;
  const ratingDisplay = hasReviews ? prof.averageRating.toFixed(1) : "—";
  const starFill = hasReviews
    ? (Math.max(0, Math.min(5, prof.averageRating)) / 5) * 100
    : 0;

  const diffLabel = prof.difficulty || "";
  const diffClass = diffLabel ? difficultyClass(diffLabel) : "";

  div.innerHTML = `
    <div class="prof-meta-top">
      <span>${prof.school}</span>
    </div>
    <h3 class="prof-name">${prof.name}</h3>
    <p class="prof-courses">📚 ${prof.coursesCount} courses</p>
    <div class="card-bottom-row">
      <div class="rating">
        <div class="rating-stars-static">
          <div class="rating-stars-bg">★★★★★</div>
          <div class="rating-stars-fill" style="width:${starFill}%;">★★★★★</div>
        </div>
        <span class="rating-score">${ratingDisplay}</span>
      </div>
      ${
        diffLabel
          ? `<span class="difficulty-badge ${diffClass}">${diffLabel}</span>`
          : ""
      }
      <div class="card-comments">
        💬 <span>${prof.reviewCount}</span>
      </div>
    </div>
  `;

  return div;
}


// ===== COURSE DETAIL PAGE =====

async function initCourseDetailPage() {
  const code = getQueryParam("code");
  if (!code) {
    window.location.href = "courses.html";
    return;
  }

  let course = null;
  let reviews = [];

  // DOM elements
  const courseCode = document.getElementById("course-code");
  const courseTitle = document.getElementById("course-title");
  const courseSchool = document.getElementById("course-school");
  const courseProfessor = document.getElementById("course-professor");
  const courseRating = document.getElementById("course-rating");
  const courseReviewCount = document.getElementById("course-review-count");
  const courseDifficulty = document.getElementById("course-difficulty");
  const courseStarsFill = document.getElementById("course-stars-fill");
  const sortSelect = document.getElementById("course-review-sort");

  // Load course data
  try {
    course = await api.getCourseByCode(code);

    // Set course info
    courseCode.textContent = course.code;
    courseTitle.textContent = course.title;
    courseSchool.textContent = course.school;

    // Set professor link
    courseProfessor.innerHTML = "👨‍🏫 ";
    const profLink = document.createElement("a");
    profLink.href = `professor-detail.html?name=${encodeURIComponent(course.professorName)}`;
    profLink.textContent = course.professorName;
    profLink.className = "prof-link";
    courseProfessor.appendChild(profLink);

    // Set rating
    const avgRating = course.averageRating || 0;
    courseRating.textContent = avgRating > 0 ? avgRating.toFixed(1) : "—";
    const starPct = (Math.max(0, Math.min(5, avgRating)) / 5) * 100;
    courseStarsFill.style.width = starPct + "%";

    // Set review count
    const count = course.reviewCount || 0;
    courseReviewCount.textContent = count === 0
      ? "No reviews yet"
      : `Based on ${count} review${count !== 1 ? "s" : ""}`;

    // Set difficulty
    courseDifficulty.textContent = course.difficulty || "";
    courseDifficulty.classList.remove("diff-easy", "diff-moderate", "diff-hard");
    if (course.difficulty) {
      courseDifficulty.classList.add(difficultyClass(course.difficulty));
    }

    // Load reviews
    await loadReviews();

  } catch (error) {
    console.error("Failed to load course:", error);
    alert("Failed to load course details");
    return;
  }

  // Load and render reviews
  async function loadReviews() {
    try {
      reviews = await api.getReviewsForCourse(course.id);
      renderReviews();
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  }

  function renderReviews() {
    const sortValue = sortSelect.value;
    const sorted = sortReviews([...reviews], sortValue);

    const container = document.getElementById("course-reviews-list");
    const empty = document.getElementById("course-reviews-empty");

    if (sorted.length === 0) {
      empty.style.display = "block";
      container.style.display = "none";
      return;
    }

    empty.style.display = "none";
    container.style.display = "block";
    container.innerHTML = "";

    sorted.forEach((review) => {
      const reviewEl = createReviewElement(review);
      container.appendChild(reviewEl);
    });
  }

  function createReviewElement(review) {
    const div = document.createElement("div");
    div.className = "review-item";

    const rating = Number(review.rating || 0);
    const ratingText = rating.toFixed(1);
    const starFill = (Math.max(0, Math.min(5, rating)) / 5) * 100;

    const dateText = formatReviewDate(review.createdAt);
    const semLabel = review.semester && review.year
      ? `${review.semester} ${review.year}`
      : "";

    div.innerHTML = `
      <div class="review-meta">
        <div class="rating rating-small">
          <div class="rating-stars-static">
            <div class="rating-stars-bg">★★★★★</div>
            <div class="rating-stars-fill" style="width:${starFill}%;">★★★★★</div>
          </div>
          <span class="rating-score">${ratingText}</span>
        </div>
        <span class="difficulty-badge ${difficultyClass(review.difficulty)} review-diff-pill">
          ${review.difficulty}
        </span>
        ${semLabel ? `<span class="review-course-label">${semLabel}</span>` : ""}
        ${semLabel && dateText ? `<span class="review-separator">|</span>` : ""}
        ${dateText ? `<span class="review-date-label">${dateText}</span>` : ""}
        ${review.canEdit ? `<button class="review-edit-btn" data-review-id="${review.id}">Edit</button>` : ""}
      </div>
      <div class="review-text">${review.text}</div>
    `;

    // Add edit handler
    if (review.canEdit) {
      const editBtn = div.querySelector(".review-edit-btn");
      editBtn.addEventListener("click", () => openEditModal(review));
    }

    return div;
  }

  function sortReviews(list, sortValue) {
    if (sortValue === "newest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortValue === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortValue === "rating-desc") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortValue === "rating-asc") {
      list.sort((a, b) => a.rating - b.rating);
    }
    return list;
  }

  sortSelect.addEventListener("change", renderReviews);

  // ===== REVIEW MODAL =====
  const modal = document.getElementById("course-review-modal");
  const backdrop = modal.querySelector(".review-modal-backdrop");
  const btnTop = document.getElementById("course-write-review-top");
  const btnEmpty = document.getElementById("course-write-review-empty");
  const btnClose = document.getElementById("course-modal-close");
  const btnCancel = document.getElementById("course-modal-cancel");
  const formEl = document.getElementById("course-modal-form");

  const diffSelect = document.getElementById("course-modal-difficulty");
  const textArea = document.getElementById("course-modal-text");
  const semesterSelect = document.getElementById("course-modal-semester");
  const yearSelect = document.getElementById("course-modal-year");

  fillYearSelect(yearSelect, 2015, 2030);

  // Star rating
  const starControl = initStarRating(
    "course-rating-stars",
    "course-rating-stars-fill",
    "course-rating-value",
    0
  );

  let editingReviewId = null;

  function openModal() {
    if (!ensureAuthed()) return;
    modal.classList.remove("hidden");
  }

  function openEditModal(review) {
    if (!ensureAuthed()) return;
    editingReviewId = review.id;
    starControl.setValue(Number(review.rating));
    diffSelect.value = review.difficulty;
    textArea.value = review.text;
    semesterSelect.value = review.semester || "";
    yearSelect.value = review.year || "";
    modal.classList.remove("hidden");
  }

  function closeModal() {
    editingReviewId = null;
    starControl.setValue(0);
    diffSelect.value = "";
    textArea.value = "";
    semesterSelect.value = "";
    yearSelect.value = "";
    modal.classList.add("hidden");
  }

  btnTop?.addEventListener("click", openModal);
  btnEmpty?.addEventListener("click", openModal);
  backdrop?.addEventListener("click", closeModal);
  btnClose?.addEventListener("click", closeModal);
  btnCancel?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  });

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!ensureAuthed()) return;

    const rating = starControl.getValue();
    const difficulty = diffSelect.value;
    const text = textArea.value.trim();
    const semester = semesterSelect.value;
    const year = yearSelect.value;

    if (rating < 0.5 || !difficulty || !text || !semester || !year) {
      alert("Please fill all fields");
      return;
    }

    const reviewData = {
      rating,
      difficulty,
      text,
      semester,
      year: parseInt(year),
      courseId: course.id,
      professorId: null
    };

    try {
      if (editingReviewId) {
        await api.updateReview(editingReviewId, reviewData);
      } else {
        await api.createReview(reviewData);
      }

      // Reload course and reviews
      course = await api.getCourseByCode(code);
      await loadReviews();

      // Update hero stats
      const avgRating = course.averageRating || 0;
      courseRating.textContent = avgRating > 0 ? avgRating.toFixed(1) : "—";
      const starPct = (Math.max(0, Math.min(5, avgRating)) / 5) * 100;
      courseStarsFill.style.width = starPct + "%";

      const count = course.reviewCount || 0;
      courseReviewCount.textContent = count === 0
        ? "No reviews yet"
        : `Based on ${count} review${count !== 1 ? "s" : ""}`;

      courseDifficulty.textContent = course.difficulty || "";
      courseDifficulty.classList.remove("diff-easy", "diff-moderate", "diff-hard");
      if (course.difficulty) {
        courseDifficulty.classList.add(difficultyClass(course.difficulty));
      }

      closeModal();
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
    }
  });
}

// ===== PROFESSOR DETAIL PAGE =====

async function initProfessorDetailPage() {
  const name = getQueryParam("name");
  if (!name) {
    window.location.href = "professors.html";
    return;
  }

  let professor = null;
  let reviews = [];

  // DOM elements
  const profName = document.getElementById("prof-name");
  const profSchool = document.getElementById("prof-school");
  const profCoursesCount = document.getElementById("prof-courses-count");
  const profRating = document.getElementById("prof-rating");
  const profReviewCount = document.getElementById("prof-review-count");
  const profDifficulty = document.getElementById("prof-difficulty");
  const profStarsFill = document.getElementById("prof-stars-fill");
  const sortSelect = document.getElementById("prof-review-sort");

  // Load professor data
  try {
    professor = await api.getProfessorByName(name);

    profName.textContent = professor.name;
    profSchool.textContent = professor.school;
    profCoursesCount.textContent = `Teaches ${professor.coursesCount} courses`;

    // Set rating
    const avgRating = professor.averageRating || 0;
    profRating.textContent = avgRating > 0 ? avgRating.toFixed(1) : "—";
    const starPct = (Math.max(0, Math.min(5, avgRating)) / 5) * 100;
    profStarsFill.style.width = starPct + "%";

    // Set review count
    const count = professor.reviewCount || 0;
    profReviewCount.textContent = count === 0
      ? "No reviews yet"
      : `Based on ${count} review${count !== 1 ? "s" : ""}`;

    // Set difficulty
    profDifficulty.textContent = professor.difficulty || "";
    profDifficulty.classList.remove("diff-easy", "diff-moderate", "diff-hard");
    if (professor.difficulty) {
      profDifficulty.classList.add(difficultyClass(professor.difficulty));
    }

    // Render courses
    renderProfessorCourses(professor.courses || []);

    // Load reviews
    await loadReviews();

  } catch (error) {
    console.error("Failed to load professor:", error);
    alert("Failed to load professor details");
    return;
  }

  function renderProfessorCourses(courses) {
    const grid = document.getElementById("prof-courses-grid");
    if (!grid) return;

    grid.innerHTML = "";
    courses.forEach((course) => {
      const card = createCourseCard(course);
      card.classList.add("clickable-card");
      card.addEventListener("click", () => {
        window.location.href = `course-detail.html?code=${encodeURIComponent(course.code)}`;
      });
      grid.appendChild(card);
    });
  }

  async function loadReviews() {
    try {
      reviews = await api.getReviewsForProfessor(professor.id);
      renderReviews();
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  }

  function renderReviews() {
    const sortValue = sortSelect.value;
    const sorted = sortReviews([...reviews], sortValue);

    const container = document.getElementById("prof-reviews-list");
    const empty = document.getElementById("prof-reviews-empty");

    if (sorted.length === 0) {
      empty.style.display = "block";
      container.style.display = "none";
      return;
    }

    empty.style.display = "none";
    container.style.display = "block";
    container.innerHTML = "";

    sorted.forEach((review) => {
      const reviewEl = createProfessorReviewElement(review);
      container.appendChild(reviewEl);
    });
  }

  function createProfessorReviewElement(review) {
    const div = document.createElement("div");
    div.className = "review-item";

    const rating = Number(review.rating || 0);
    const ratingText = rating.toFixed(1);
    const starFill = (Math.max(0, Math.min(5, rating)) / 5) * 100;

    const courseLabel = review.courseCode && review.courseTitle
      ? `${review.courseCode} – ${review.courseTitle}`
      : "General feedback";

    const dateText = formatReviewDate(review.createdAt);
    const semLabel = review.semester && review.year
      ? `${review.semester} ${review.year}`
      : "";

    div.innerHTML = `
      <div class="review-meta">
        <div class="rating rating-small">
          <div class="rating-stars-static">
            <div class="rating-stars-bg">★★★★★</div>
            <div class="rating-stars-fill" style="width:${starFill}%;">★★★★★</div>
          </div>
          <span class="rating-score">${ratingText}</span>
        </div>
        <span class="difficulty-badge ${difficultyClass(review.difficulty)} review-diff-pill">
          ${review.difficulty}
        </span>
        <span class="review-course-label">${courseLabel}</span>
        ${semLabel ? `<span class="review-course-label">${semLabel}</span>` : ""}
        ${semLabel && dateText ? `<span class="review-separator">|</span>` : ""}
        ${dateText ? `<span class="review-date-label">${dateText}</span>` : ""}
        ${review.canEdit ? `<button class="review-edit-btn" data-review-id="${review.id}">Edit</button>` : ""}
      </div>
      <div class="review-text">${review.text}</div>
    `;

    if (review.canEdit) {
      const editBtn = div.querySelector(".review-edit-btn");
      editBtn.addEventListener("click", () => openEditModal(review));
    }

    return div;
  }

  function sortReviews(list, sortValue) {
    if (sortValue === "newest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortValue === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortValue === "rating-desc") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortValue === "rating-asc") {
      list.sort((a, b) => a.rating - b.rating);
    }
    return list;
  }

  sortSelect.addEventListener("change", renderReviews);

  // ===== REVIEW MODAL =====
  const modal = document.getElementById("prof-review-modal");
  const backdrop = modal.querySelector(".review-modal-backdrop");
  const btnTop = document.getElementById("prof-write-review-top");
  const btnEmpty = document.getElementById("prof-write-review-empty");
  const btnClose = document.getElementById("prof-modal-close");
  const btnCancel = document.getElementById("prof-modal-cancel");
  const formEl = document.getElementById("prof-modal-form");

  const diffSelect = document.getElementById("prof-modal-difficulty");
  const textArea = document.getElementById("prof-modal-text");
  const courseSelect = document.getElementById("prof-modal-course");
  const semesterSelect = document.getElementById("prof-modal-semester");
  const yearSelect = document.getElementById("prof-modal-year");

  fillYearSelect(yearSelect, 2015, 2030);

  // Populate course select
  if (courseSelect && professor.courses) {
    courseSelect.innerHTML = '<option value="">Select course</option>';
    professor.courses.forEach((course) => {
      const opt = document.createElement("option");
      opt.value = course.id;
      opt.textContent = `${course.code} – ${course.title}`;
      courseSelect.appendChild(opt);
    });
  }

  const starControl = initStarRating(
    "prof-rating-stars",
    "prof-rating-stars-fill",
    "prof-rating-value",
    0
  );

  let editingReviewId = null;

  function openModal() {
    if (!ensureAuthed()) return;
    modal.classList.remove("hidden");
  }

  function openEditModal(review) {
    if (!ensureAuthed()) return;
    editingReviewId = review.id;
    starControl.setValue(Number(review.rating));
    diffSelect.value = review.difficulty;
    textArea.value = review.text;

    // Find course by code
    const courseOption = Array.from(courseSelect.options).find(opt => {
      return opt.textContent.startsWith(review.courseCode);
    });
    if (courseOption) {
      courseSelect.value = courseOption.value;
    }

    semesterSelect.value = review.semester || "";
    yearSelect.value = review.year || "";
    modal.classList.remove("hidden");
  }

  function closeModal() {
    editingReviewId = null;
    starControl.setValue(0);
    diffSelect.value = "";
    textArea.value = "";
    courseSelect.value = "";
    semesterSelect.value = "";
    yearSelect.value = "";
    modal.classList.add("hidden");
  }

  btnTop?.addEventListener("click", openModal);
  btnEmpty?.addEventListener("click", openModal);
  backdrop?.addEventListener("click", closeModal);
  btnClose?.addEventListener("click", closeModal);
  btnCancel?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  });

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!ensureAuthed()) return;

    const rating = starControl.getValue();
    const difficulty = diffSelect.value;
    const text = textArea.value.trim();
    const courseId = courseSelect.value;
    const semester = semesterSelect.value;
    const year = yearSelect.value;

    if (rating < 0.5 || !difficulty || !text || !courseId || !semester || !year) {
      alert("Please fill all fields");
      return;
    }

    const reviewData = {
      rating,
      difficulty,
      text,
      semester,
      year: parseInt(year),
      courseId: parseInt(courseId),
      professorId: professor.id
    };

    try {
      if (editingReviewId) {
        await api.updateReview(editingReviewId, reviewData);
      } else {
        await api.createReview(reviewData);
      }

      // Reload professor and reviews
      professor = await api.getProfessorByName(name);
      await loadReviews();

      // Update hero stats
      const avgRating = professor.averageRating || 0;
      profRating.textContent = avgRating > 0 ? avgRating.toFixed(1) : "—";
      const starPct = (Math.max(0, Math.min(5, avgRating)) / 5) * 100;
      profStarsFill.style.width = starPct + "%";

      const count = professor.reviewCount || 0;
      profReviewCount.textContent = count === 0
        ? "No reviews yet"
        : `Based on ${count} review${count !== 1 ? "s" : ""}`;

      profDifficulty.textContent = professor.difficulty || "";
      profDifficulty.classList.remove("diff-easy", "diff-moderate", "diff-hard");
      if (professor.difficulty) {
        profDifficulty.classList.add(difficultyClass(professor.difficulty));
      }

      closeModal();
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
    }
  });
}

// ===== UTILITY FUNCTIONS =====

function fillYearSelect(selectEl, start, end) {
  if (!selectEl) return;
  selectEl.innerHTML = '<option value="">Year</option>';
  for (let y = end; y >= start; y--) {
    const opt = document.createElement("option");
    opt.value = String(y);
    opt.textContent = String(y);
    selectEl.appendChild(opt);
  }
}

function initStarRating(wrapperId, fillId, valueId, initialValue) {
  const wrapper = document.getElementById(wrapperId);
  const fill = document.getElementById(fillId);
  const valueLabel = document.getElementById(valueId);

  if (!wrapper || !fill || !valueLabel) {
    return { getValue: () => 0, setValue: () => {} };
  }

  let current = typeof initialValue === "number" ? initialValue : 0;

  function setVisual(val) {
    const clamped = Math.max(0, Math.min(5, val));
    const pct = (clamped / 5) * 100;
    fill.style.width = pct + "%";
    valueLabel.textContent = clamped.toFixed(1) + "/5";
  }

  setVisual(current);

  wrapper.addEventListener("mousemove", (e) => {
    const rect = wrapper.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const val = Math.round(ratio * 5 * 2) / 2;
    setVisual(val);
  });

  wrapper.addEventListener("mouseleave", () => {
    setVisual(current);
  });

  wrapper.addEventListener("click", (e) => {
    const rect = wrapper.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    let val = Math.round(ratio * 5 * 2) / 2;
    if (val < 0.5) val = 0.5;
    current = val;
    setVisual(current);
  });

  return {
    getValue: () => current,
    setValue: (v) => {
      current = Math.max(0, Math.min(5, v));
      setVisual(current);
    },
  };
}

function formatReviewDate(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}