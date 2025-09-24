// DOM Elements
const postsContainer = document.getElementById("posts-container");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categorySelect");
const newPostForm = document.getElementById("newPostForm");
const postMediaInput = document.getElementById("postMedia");
const usernameDisplay = document.getElementById("usernameDisplay");

// Current user
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "Guest" };
localStorage.setItem("currentUser", JSON.stringify(currentUser));
if (usernameDisplay) usernameDisplay.textContent = currentUser.username;

// Posts array
let posts = JSON.parse(localStorage.getItem("posts")) || [
  {
    title: "The Future of Technology: Innovations Shaping Our World",
    content: "Technology continues to evolve at an unprecedented pace, transforming the way we live, work, and communicate...",
    category: "Tech",
    media: null,
    mediaType: null,
    date: new Date().toISOString(),
    author: "Guest"
  }
];
localStorage.setItem("posts", JSON.stringify(posts));

// Badge color
function getCategoryClass(category) {
  switch(category) {
    case "Tech": return "bg-primary";
    case "Lifestyle": return "bg-warning";
    case "Travel": return "bg-success";
    case "Food": return "bg-danger";
    case "Education": return "bg-info";
    default: return "bg-secondary";
  }
}

// Render posts
function renderPosts() {
  if (!postsContainer) return;
  postsContainer.innerHTML = "";

  const searchValue = searchInput?.value.toLowerCase() || "";
  const categoryValue = categoryFilter?.value || "all";

  const filtered = posts.filter(post =>
    (post.title.toLowerCase().includes(searchValue) || post.content.toLowerCase().includes(searchValue)) &&
    (categoryValue === "all" || post.category === categoryValue)
  );

  if (filtered.length === 0) {
    postsContainer.innerHTML = "<p class='text-center'>No posts found.</p>";
    return;
  }

  filtered.forEach((post, index) => {
    const col = document.createElement("div");
    col.classList.add("col-md-4", "mb-4");
    col.innerHTML = `
      <div class="post-card card p-3">
        ${post.media ? 
          (post.mediaType?.startsWith("video") 
            ? `<video src="${post.media}" controls width="100%" class="post-media" data-index="${index}"></video>` 
            : `<img src="${post.media}" style="width:100%; max-height:200px; object-fit:cover;" class="post-media" data-index="${index}">`) 
          : `<img src="https://via.placeholder.com/300x200?text=${post.category}" alt="default image" class="post-media" data-index="${index}">`}
        <h5 class="mt-2">${post.title}</h5>
        <p>${post.content}</p>
        <span class="badge ${getCategoryClass(post.category)}">${post.category}</span>
        <p class="text-muted small mt-2">${post.author} | ${new Date(post.date).toLocaleDateString()}</p>
        ${post.author === currentUser.username ? `
          <button class="btn btn-sm btn-warning mt-2 editBtn" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger mt-2 deleteBtn" data-index="${index}">Delete</button>` : ''}
      </div>
    `;
    postsContainer.appendChild(col);
  });

  // Attach edit/delete events
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = e.target.dataset.index;
      if(confirm("Are you sure you want to delete this post?")) {
        posts.splice(idx, 1);
        localStorage.setItem("posts", JSON.stringify(posts));
        renderPosts();
      }
    });
  });

  document.querySelectorAll(".editBtn").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = e.target.dataset.index;
      localStorage.setItem("editPost", JSON.stringify({ ...posts[idx], index: idx }));
      window.location.href = "newpost.html?edit=true";
    });
  });

  // Click to view post
  document.querySelectorAll(".post-media").forEach(mediaEl => {
    mediaEl.addEventListener("click", e => {
      const idx = e.target.dataset.index;
      localStorage.setItem("viewPost", JSON.stringify(posts[idx]));
      window.location.href = "post.html";
    });
  });
}

// Search & Filter
if (searchInput) searchInput.addEventListener("input", renderPosts);
if (categoryFilter) categoryFilter.addEventListener("change", renderPosts);

// New Post Form
if (newPostForm) {
  const mediaPreview = document.getElementById("mediaPreview");
  postMediaInput.addEventListener("change", () => {
    const file = postMediaInput.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onload = e => {
        mediaPreview.innerHTML = file.type.startsWith("video")
          ? `<video src="${e.target.result}" controls width="100%"></video>`
          : `<img src="${e.target.result}" style="width:100%; max-height:200px; object-fit:cover;">`;
      };
      reader.readAsDataURL(file);
    } else {
      mediaPreview.innerHTML = "";
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const isEdit = urlParams.get("edit") === "true";

  // Pre-fill form if editing
  if(isEdit) {
    const post = JSON.parse(localStorage.getItem("editPost"));
    document.getElementById("postTitle").value = post.title;
    document.getElementById("postContent").value = post.content;
    document.getElementById("postCategory").value = post.category;
    if(post.media) {
      mediaPreview.innerHTML = post.mediaType?.startsWith("video")
        ? `<video src="${post.media}" controls width="100%"></video>`
        : `<img src="${post.media}" style="width:100%; max-height:200px; object-fit:cover;">`;
    }
  }

  newPostForm.addEventListener("submit", e => {
    e.preventDefault();
    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();
    const category = document.getElementById("postCategory").value;
    const file = postMediaInput.files[0];

    function savePost(media) {
      if(isEdit) {
        const editData = JSON.parse(localStorage.getItem("editPost"));
        posts[editData.index] = {
          title, content, category,
          media: media || editData.media,
          mediaType: file ? file.type : editData.mediaType,
          date: new Date().toISOString(),
          author: currentUser.username
        };
      } else {
        posts.unshift({
          title, content, category,
          media: media || null,
          mediaType: file ? file.type : null,
          date: new Date().toISOString(),
          author: currentUser.username
        });
      }
      localStorage.setItem("posts", JSON.stringify(posts));
      newPostForm.reset();
      window.location.href = "index.html";
    }

    if(file) {
      const reader = new FileReader();
      reader.onload = e => savePost(e.target.result);
      reader.readAsDataURL(file);
    } else {
      savePost(null);
    }
  });
}

// Initial render
renderPosts();
