// Biến lưu trữ giỏ hàng, được lưu vào localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(name, price, image) {
  // Tìm kiếm sản phẩm trong giỏ hàng
  const existingProduct = cart.find(item => item.name === name);

  if (existingProduct) {
    // Nếu sản phẩm đã tồn tại, tăng số lượng lên 1
    existingProduct.quantity++;
  } else {
    // Nếu sản phẩm chưa có, thêm sản phẩm mới vào giỏ hàng với số lượng là 1
    cart.push({
      name: name,
      price: price,
      image: image,
      quantity: 1
    });
  }

  // Cập nhật giỏ hàng vào localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`Đã thêm ${name} vào giỏ hàng!`);
  updateCartDisplay();
}

function updateCartDisplay() {
  const cartItemsContainer = document.getElementById('cart-items');
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; margin-right: 10px;">
      ${item.name} - Giá: ${item.price.toLocaleString('vi-VN')}đ - Số lượng: 
      <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${index}, this.value)">
      <button onclick="removeFromCart(${index})">Xóa</button>
      <div style="font-weight: bold; color: #ff5722;">Tổng: ${(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
    `;
    cartItemsContainer.appendChild(li);
    total += item.price * item.quantity;
  });

  document.getElementById('total').innerText = `Tổng cộng: ${total.toLocaleString('vi-VN')}đ`;

  if (cart.length > 0) {
    document.getElementById('checkout-btn').style.display = 'block';
  } else {
    document.getElementById('checkout-btn').style.display = 'none';
  }
}

function updateQuantity(index, newQuantity) {
  const newQty = parseInt(newQuantity);
  if (newQty > 0) {
    cart[index].quantity = newQty;
  } else {
    cart.splice(index, 1);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
}

function checkout() {
  document.getElementById('checkout-btn').style.display = 'none';
  document.getElementById('checkout-form').style.display = 'block';
}

function confirmOrder() {
  const name = document.getElementById('name').value;
  const addressNumber = document.getElementById('address_number').value;
  const addressStreet = document.getElementById('address_street').value;
  const addressWard = document.getElementById('address_ward').value;
  const addressDistrict = document.getElementById('address_district').value;
  const addressProvince = document.getElementById('address_province').value;
  const phone = document.getElementById('phone').value;

  if (!name || !addressNumber || !addressStreet || !addressWard || !addressDistrict || !addressProvince || !phone) {
    alert("Vui lòng điền đầy đủ thông tin.");
    return;
  }

  const order = {
    time: new Date().toLocaleString('vi-VN'),
    customer: {
      name,
      address: `${addressNumber}, ${addressStreet}, ${addressWard}, ${addressDistrict}, ${addressProvince}`,
      phone
    },
    items: cart
  };

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  let orderSummary = `
    Họ tên: ${name}<br>
    Địa chỉ: ${addressNumber}, ${addressStreet}, ${addressWard}, ${addressDistrict}, ${addressProvince}<br>
    Số điện thoại: ${phone}
  `;

  let orderDetail = '';
  cart.forEach(item => {
    orderDetail += `<p>${item.name} - Số lượng: ${item.quantity} - Giá: ${(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>`;
  });

  document.getElementById('order-summary').innerHTML = orderSummary;
  document.getElementById('order-detail').innerHTML = orderDetail;

  document.getElementById('checkout-form').style.display = 'none';
  document.getElementById('order-info').style.display = 'block';

  cart = [];
  localStorage.removeItem('cart');
  updateCartDisplay();
}

function startNewOrder() {
  document.getElementById('checkout-btn').style.display = 'block';
  document.getElementById('checkout-form').style.display = 'none';
  document.getElementById('order-info').style.display = 'none';
  window.location.href = 'catalog.html';
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartDisplay();
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', checkout);
  }

  const confirmBtn = document.getElementById('confirm-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', confirmOrder);
  }

  const newOrderBtn = document.getElementById('new-order-btn');
  if (newOrderBtn) {
    newOrderBtn.addEventListener('click', startNewOrder);
  }
});