let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Thêm sản phẩm (có thêm ảnh)
function addToCart(name, price, img) {
  cart.push({ name, price, img });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(name + " đã được thêm vào giỏ!");
}

// Load giỏ hàng
function loadCart() {
  let cartItems = document.getElementById("cart-items");
  let total = 0;
  cartItems.innerHTML = "";

  cart.forEach((item, index) => {
    let li = document.createElement("li");
    li.innerHTML = `
      <img src="${item.img}" alt="${item.name}" style="max-width: 60px; max-height: 60px; object-fit: cover;">
      <div class="info">
        <strong>${item.name}</strong><br>
        <span>${item.price.toLocaleString()}đ</span>
      </div>
      <button onclick="removeFromCart(${index})">❌ Xóa</button>
    `;
    cartItems.appendChild(li);
    total += item.price;
  });

  document.getElementById("total").textContent = "Tổng: " + total.toLocaleString() + "đ";
}

// Xóa sản phẩm
function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}


// Khi load trang giỏ
if (document.getElementById("cart-items")) {
  loadCart();
  // Xử lý nút mua hàng
  const checkoutBtn = document.getElementById("checkout-btn");
  const checkoutForm = document.getElementById("checkout-form");
  const confirmBtn = document.getElementById("confirm-btn");
  if (checkoutBtn && checkoutForm && confirmBtn) {
    checkoutBtn.onclick = function() {
      if (cart.length === 0) {
        alert("Giỏ hàng trống!");
        return;
      }
      checkoutForm.style.display = "block";
    };
    confirmBtn.onclick = function() {
      const name = document.getElementById("name").value.trim();
      const address_number = document.getElementById("address_number").value.trim();
      const address_street = document.getElementById("address_street").value.trim();
      const address_ward = document.getElementById("address_ward").value.trim();
      const address_district = document.getElementById("address_district").value.trim();
      const address_province = document.getElementById("address_province").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const phoneRegex = /^0\d{9}$/;
      if (!name || !address_number || !address_street || !address_ward || !address_district || !address_province || !phone) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }
      if (!phoneRegex.test(phone)) {
        alert("Số điện thoại phải bắt đầu bằng 0 và đủ 10 số!");
        return;
      }
      // Lưu đơn hàng vào localStorage
      let orders = JSON.parse(localStorage.getItem("orders")) || [];
      const order = {
        name,
        address: `${address_number}, ${address_street}, ${address_ward}, ${address_district}, ${address_province}`,
        phone,
        cart: cart,
        total: cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
        time: new Date().toLocaleString()
      };
      orders.push(order);
      localStorage.setItem("orders", JSON.stringify(orders));
      // Hiển thị thông tin người nhận
      document.getElementById("order-info").style.display = "block";
      document.getElementById("order-detail").innerHTML = `
        <strong>Họ tên:</strong> ${order.name}<br>
        <strong>Địa chỉ:</strong> ${order.address}<br>
        <strong>Số điện thoại:</strong> ${order.phone}<br>
        <strong>Tổng tiền:</strong> ${order.total.toLocaleString()}đ<br>
        <strong>Thời gian đặt:</strong> ${order.time}
      `;
      // Xóa giỏ hàng
      cart = [];
      localStorage.setItem("cart", JSON.stringify(cart));
      document.getElementById("cart-items").innerHTML = "";
      document.getElementById("total").textContent = "";
      checkoutForm.style.display = "none";
      checkoutBtn.style.display = "none";
      alert("Cảm ơn bạn đã đặt hàng!");
    };
// ...existing code...
  }
}