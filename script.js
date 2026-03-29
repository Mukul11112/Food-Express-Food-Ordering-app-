// ------------------------
// Initial Data
// ------------------------
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let restaurants = JSON.parse(localStorage.getItem("restaurants")) || [
  { id: 1, name: "Spicy Hub", cuisine: "Indian" },
  { id: 2, name: "Pizza World", cuisine: "Italian" },
  { id: 3, name: "Burger Point", cuisine: "Fast Food" }
];

let menuItems = JSON.parse(localStorage.getItem("menuItems")) || [
  { id: 1, restaurantId: 1, name: "Paneer Butter Masala", price: 220 },
  { id: 2, restaurantId: 1, name: "Veg Biryani", price: 180 },
  { id: 3, restaurantId: 2, name: "Margherita Pizza", price: 250 },
  { id: 4, restaurantId: 2, name: "Farmhouse Pizza", price: 320 },
  { id: 5, restaurantId: 3, name: "Cheese Burger", price: 160 },
  { id: 6, restaurantId: 3, name: "French Fries", price: 120 }
];

let selectedRestaurantId = null;

// ------------------------
// Save Helpers
// ------------------------
function saveAll() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("orders", JSON.stringify(orders));
  localStorage.setItem("restaurants", JSON.stringify(restaurants));
  localStorage.setItem("menuItems", JSON.stringify(menuItems));
}

// ------------------------
// DOM Load
// ------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateCurrentUserUI();
  renderRestaurants();
  renderMenu();
  renderCart();
  renderOrders();
  renderAdminRestaurants();
  renderAdminMenus();
  populateRestaurantDropdown();

  document.getElementById("registerForm").addEventListener("submit", registerUser);
  document.getElementById("loginForm").addEventListener("submit", loginUser);
  document.getElementById("orderForm").addEventListener("submit", placeOrder);
  document.getElementById("restaurantForm").addEventListener("submit", addRestaurant);
  document.getElementById("menuForm").addEventListener("submit", addMenuItem);
  document.getElementById("searchRestaurant").addEventListener("input", searchRestaurants);
});

// ------------------------
// User Registration
// ------------------------
function registerUser(e) {
  e.preventDefault();

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();
  const registerMessage = document.getElementById("registerMessage");

  if (!name || !email || !password) {
    registerMessage.textContent = "Please fill all fields.";
    registerMessage.className = "mt-3 text-center fw-semibold text-danger";
    return;
  }

  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    registerMessage.textContent = "User already exists.";
    registerMessage.className = "mt-3 text-center fw-semibold text-danger";
    return;
  }

  users.push({ name, email, password });
  saveAll();

  registerMessage.textContent = "Registration successful.";
  registerMessage.className = "mt-3 text-center fw-semibold text-success";

  document.getElementById("registerForm").reset();
}

// ------------------------
// User Login
// ------------------------
function loginUser(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const loginMessage = document.getElementById("loginMessage");

  const foundUser = users.find(user => user.email === email && user.password === password);

  if (!foundUser) {
    loginMessage.textContent = "Invalid email or password.";
    loginMessage.className = "mt-3 text-center fw-semibold text-danger";
    return;
  }

  currentUser = foundUser;
  saveAll();
  updateCurrentUserUI();

  loginMessage.textContent = "Login successful.";
  loginMessage.className = "mt-3 text-center fw-semibold text-success";

  document.getElementById("loginForm").reset();
}

function updateCurrentUserUI() {
  document.getElementById("currentUser").textContent = currentUser ? currentUser.name : "None";
}

// ------------------------
// Restaurants
// ------------------------
function renderRestaurants(filteredRestaurants = restaurants) {
  const restaurantList = document.getElementById("restaurantList");

  if (filteredRestaurants.length === 0) {
    restaurantList.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger text-center">No restaurant found.</div>
      </div>
    `;
    return;
  }

  restaurantList.innerHTML = filteredRestaurants.map(restaurant => `
    <div class="col-md-4 mb-4">
      <div class="card restaurant-card shadow-sm h-100">
        <div class="card-body">
          <h5 class="card-title">${restaurant.name}</h5>
          <p class="card-text">Cuisine: ${restaurant.cuisine}</p>
          <button class="btn btn-primary" onclick="viewMenu(${restaurant.id})">
            View Menu
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function searchRestaurants() {
  const searchValue = document.getElementById("searchRestaurant").value.toLowerCase();
  const filtered = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchValue) ||
    restaurant.cuisine.toLowerCase().includes(searchValue)
  );
  renderRestaurants(filtered);
}

// ------------------------
// Menu
// ------------------------
function viewMenu(restaurantId) {
  selectedRestaurantId = restaurantId;
  renderMenu();
}

function renderMenu() {
  const menuList = document.getElementById("menuList");

  if (!selectedRestaurantId) {
    menuList.innerHTML = `
      <div class="col-12">
        <div class="alert alert-secondary text-center">
          Select a restaurant to view menu
        </div>
      </div>
    `;
    return;
  }

  const items = menuItems.filter(item => item.restaurantId === selectedRestaurantId);

  if (items.length === 0) {
    menuList.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning text-center">No menu items available.</div>
      </div>
    `;
    return;
  }

  menuList.innerHTML = items.map(item => `
    <div class="col-md-4 mb-4">
      <div class="card menu-card shadow-sm h-100">
        <div class="card-body">
          <h5 class="card-title">${item.name}</h5>
          <p class="menu-price">₹${item.price}</p>
          <button class="btn btn-success" onclick="addToCart(${item.id})">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

// ------------------------
// Cart
// ------------------------
function addToCart(itemId) {
  if (!currentUser) {
    alert("Please login first.");
    return;
  }

  const menuItem = menuItems.find(item => item.id === itemId);
  const existingItem = cart.find(item => item.id === itemId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...menuItem, quantity: 1 });
  }

  saveAll();
  renderCart();
}

function renderCart() {
  const cartItemsDiv = document.getElementById("cartItems");
  const cartTotalSpan = document.getElementById("cartTotal");
  const cartCountSpan = document.getElementById("cartCount");

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `<p class="text-muted">Your cart is empty.</p>`;
    cartTotalSpan.textContent = 0;
    cartCountSpan.textContent = 0;
    return;
  }

  let total = 0;
  let count = 0;

  cartItemsDiv.innerHTML = cart.map(item => {
    total += item.price * item.quantity;
    count += item.quantity;

    return `
      <div class="cart-item d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-1">${item.name}</h6>
          <p class="mb-0">₹${item.price} x ${item.quantity}</p>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="changeQuantity(${item.id}, 1)">+</button>
          <button class="btn btn-sm btn-outline-secondary me-1" onclick="changeQuantity(${item.id}, -1)">-</button>
          <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    `;
  }).join("");

  cartTotalSpan.textContent = total;
  cartCountSpan.textContent = count;
}

function changeQuantity(itemId, change) {
  const item = cart.find(cartItem => cartItem.id === itemId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(cartItem => cartItem.id !== itemId);
  }

  saveAll();
  renderCart();
}

function removeFromCart(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  saveAll();
  renderCart();
}

function clearCart() {
  cart = [];
  saveAll();
  renderCart();
}

// ------------------------
// Place Order
// ------------------------
function placeOrder(e) {
  e.preventDefault();

  const orderMessage = document.getElementById("orderMessage");
  const address = document.getElementById("deliveryAddress").value.trim();
  const paymentMethod = document.getElementById("paymentMethod").value;

  if (!currentUser) {
    orderMessage.textContent = "Please login first.";
    orderMessage.className = "mt-3 text-center fw-semibold text-danger";
    return;
  }

  if (cart.length === 0) {
    orderMessage.textContent = "Cart is empty. Please add items first.";
    orderMessage.className = "mt-3 text-center fw-semibold text-danger";
    return;
  }

  if (!address || !paymentMethod) {
    orderMessage.textContent = "Please enter address and select payment method.";
    orderMessage.className = "mt-3 text-center fw-semibold text-danger";
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const newOrder = {
    id: Date.now(),
    customer: currentUser.name,
    items: [...cart],
    address,
    paymentMethod,
    total,
    status: "Placed"
  };

  orders.unshift(newOrder);
  cart = [];

  saveAll();
  renderCart();
  renderOrders();

  orderMessage.textContent = `Order placed successfully. Order ID: ${newOrder.id}`;
  orderMessage.className = "mt-3 text-center fw-semibold text-success";

  document.getElementById("orderForm").reset();
}

// ------------------------
// Order Tracking
// ------------------------
function renderOrders() {
  const orderTrackingList = document.getElementById("orderTrackingList");

  if (orders.length === 0) {
    orderTrackingList.innerHTML = `
      <div class="col-12">
        <div class="alert alert-secondary text-center">No orders placed yet.</div>
      </div>
    `;
    return;
  }

  orderTrackingList.innerHTML = orders.map(order => `
    <div class="col-lg-6">
      <div class="card shadow-sm h-100">
        <div class="card-body">
          <h5>Order ID: ${order.id}</h5>
          <p><strong>Customer:</strong> ${order.customer}</p>
          <p><strong>Items:</strong> ${order.items.map(item => `${item.name} (${item.quantity})`).join(", ")}</p>
          <p><strong>Total:</strong> ₹${order.total}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod}</p>
          <p><strong>Address:</strong> ${order.address}</p>
          <p>
            <strong>Status:</strong>
            <span class="badge bg-success order-status-badge">${order.status}</span>
          </p>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-sm btn-outline-primary" onclick="updateOrderStatus(${order.id}, 'Preparing')">Preparing</button>
            <button class="btn btn-sm btn-outline-warning" onclick="updateOrderStatus(${order.id}, 'Out for Delivery')">Out for Delivery</button>
            <button class="btn btn-sm btn-outline-success" onclick="updateOrderStatus(${order.id}, 'Delivered')">Delivered</button>
            <button class="btn btn-sm btn-outline-danger" onclick="updateOrderStatus(${order.id}, 'Cancelled')">Cancelled</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

function updateOrderStatus(orderId, newStatus) {
  const order = orders.find(orderItem => orderItem.id === orderId);
  if (!order) return;

  order.status = newStatus;
  saveAll();
  renderOrders();
}

// ------------------------
// Admin
// ------------------------
function addRestaurant(e) {
  e.preventDefault();

  const name = document.getElementById("restaurantName").value.trim();
  const cuisine = document.getElementById("restaurantCuisine").value.trim();

  if (!name || !cuisine) return;

  const newRestaurant = {
    id: Date.now(),
    name,
    cuisine
  };

  restaurants.push(newRestaurant);
  saveAll();

  renderRestaurants();
  renderAdminRestaurants();
  populateRestaurantDropdown();

  document.getElementById("restaurantForm").reset();
}

function addMenuItem(e) {
  e.preventDefault();

  const restaurantId = parseInt(document.getElementById("menuRestaurantSelect").value);
  const name = document.getElementById("menuItemName").value.trim();
  const price = parseInt(document.getElementById("menuItemPrice").value);

  if (!restaurantId || !name || !price) return;

  const newMenuItem = {
    id: Date.now(),
    restaurantId,
    name,
    price
  };

  menuItems.push(newMenuItem);
  saveAll();

  renderMenu();
  renderAdminMenus();

  document.getElementById("menuForm").reset();
}

function populateRestaurantDropdown() {
  const menuRestaurantSelect = document.getElementById("menuRestaurantSelect");

  menuRestaurantSelect.innerHTML = `
    <option value="">Select Restaurant</option>
    ${restaurants.map(restaurant => `
      <option value="${restaurant.id}">${restaurant.name}</option>
    `).join("")}
  `;
}

function renderAdminRestaurants() {
  const adminRestaurantList = document.getElementById("adminRestaurantList");

  if (restaurants.length === 0) {
    adminRestaurantList.innerHTML = `<p class="text-muted">No restaurants available.</p>`;
    return;
  }

  adminRestaurantList.innerHTML = restaurants.map(restaurant => `
    <div class="admin-list-item d-flex justify-content-between align-items-center">
      <div>
        <strong>${restaurant.name}</strong><br>
        <small>${restaurant.cuisine}</small>
      </div>
      <button class="btn btn-sm btn-danger" onclick="deleteRestaurant(${restaurant.id})">Delete</button>
    </div>
  `).join("");
}

function renderAdminMenus() {
  const adminMenuList = document.getElementById("adminMenuList");

  if (menuItems.length === 0) {
    adminMenuList.innerHTML = `<p class="text-muted">No menu items available.</p>`;
    return;
  }

  adminMenuList.innerHTML = menuItems.map(item => {
    const restaurant = restaurants.find(res => res.id === item.restaurantId);
    return `
      <div class="admin-list-item d-flex justify-content-between align-items-center">
        <div>
          <strong>${item.name}</strong><br>
          <small>${restaurant ? restaurant.name : "Unknown"} | ₹${item.price}</small>
        </div>
        <button class="btn btn-sm btn-danger" onclick="deleteMenuItem(${item.id})">Delete</button>
      </div>
    `;
  }).join("");
}

function deleteRestaurant(id) {
  restaurants = restaurants.filter(restaurant => restaurant.id !== id);
  menuItems = menuItems.filter(item => item.restaurantId !== id);

  if (selectedRestaurantId === id) {
    selectedRestaurantId = null;
  }

  saveAll();
  renderRestaurants();
  renderMenu();
  renderAdminRestaurants();
  renderAdminMenus();
  populateRestaurantDropdown();
}

function deleteMenuItem(id) {
  menuItems = menuItems.filter(item => item.id !== id);
  saveAll();
  renderMenu();
  renderAdminMenus();
}