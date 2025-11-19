// --- CẤU HÌNH CHUNG ---
const CART_KEY = 'shop_cart'; 
const ORDERS_KEY = 'shop_orders'; 

// Hàm định dạng tiền tệ (VND)
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// --- 1. THÊM VÀO GIỎ HÀNG ---
function addToCart(name, price, img) {
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    let existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, img: img, quantity: 1 });
    }
    
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // Chỉ hiện thông báo nếu không phải đang ở trang giỏ hàng (để tránh spam popup khi mua ngay)
    if (!window.location.pathname.includes('cart.html')) {
        alert(`Đã thêm "${name}" vào giỏ hàng!`);
    }
}

// --- 2. HIỂN THỊ GIỎ HÀNG (Quan trọng) ---
function renderCart() {
    const cartBody = document.getElementById('cart-body');
    const totalPriceEl = document.getElementById('total-price');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const cartTable = document.querySelector('.cart-table');

    // Nếu không có thẻ cart-body thì dừng (đang ở trang khác)
    if (!cartBody) return;

    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

    // Nếu giỏ hàng trống
    if (cart.length === 0) {
        cartTable.style.display = 'none';
        emptyMsg.style.display = 'block';
        if(totalPriceEl) totalPriceEl.innerText = '0đ';
        return;
    }

    // Nếu có sản phẩm
    cartTable.style.display = 'table';
    emptyMsg.style.display = 'none';
    
    let total = 0;
    let html = '';

    cart.forEach((item, index) => {
        let itemTotal = item.price * item.quantity;
        total += itemTotal;

        html += `
            <tr>
                <td>
                    <div class="item-info">
                        <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60'">
                        <div>
                            <strong>${item.name}</strong>
                        </div>
                    </div>
                </td>
                <td style="font-weight: 600;">${formatCurrency(item.price)}</td>
                <td>
                    <input type="number" value="${item.quantity}" min="1" 
                           onchange="updateQuantity(${index}, this.value)"
                           style="width: 50px; padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
                </td>
                <td>
                    <button class="btn-remove" onclick="removeFromCart(${index})">Xóa</button>
                </td>
            </tr>
        `;
    });

    cartBody.innerHTML = html;
    if(totalPriceEl) totalPriceEl.innerText = formatCurrency(total);
}

// --- 3. XÓA SẢN PHẨM (Chức năng bạn đang cần) ---
function removeFromCart(index) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này không?')) {
        let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        cart.splice(index, 1); // Xóa 1 phần tử tại vị trí index
        localStorage.setItem(CART_KEY, JSON.stringify(cart)); // Lưu lại mảng mới
        renderCart(); // Vẽ lại giao diện ngay lập tức
    }
}

// --- 4. CẬP NHẬT SỐ LƯỢNG ---
function updateQuantity(index, newQty) {
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    newQty = parseInt(newQty);
    if (newQty < 1) newQty = 1;
    
    if (cart[index]) {
        cart[index].quantity = newQty;
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCart();
    }
}

// --- 5. THANH TOÁN & GỬI ZALO ---
function handleCheckout(e) {
    e.preventDefault();
    
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    if (cart.length === 0) {
        alert('Giỏ hàng đang trống!');
        return;
    }

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    // Kiểm tra số điện thoại
    if (phone.length < 10) {
        alert("Vui lòng nhập số điện thoại hợp lệ!");
        return;
    }

    // Tạo nội dung tin nhắn Zalo
    let msg = `👋 Đơn hàng mới!\n👤 Tên: ${name}\n📞 SĐT: ${phone}\n🏡 ĐC: ${address}\n----------------\n`;
    let total = 0;
    cart.forEach(item => {
        msg += `- ${item.name} x${item.quantity}: ${formatCurrency(item.price * item.quantity)}\n`;
        total += item.price * item.quantity;
    });
    msg += `----------------\n💰 TỔNG: ${formatCurrency(total)}`;

    // Lưu lịch sử đơn hàng
    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleString('vi-VN'),
        customer: { name, phone, address },
        items: cart,
        totalPrice: total
    };
    let orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    orders.push(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    // Xóa giỏ hàng
    localStorage.removeItem(CART_KEY);

    
    const yourZaloPhone = '84397768941'; 
    const zaloUrl = `https://zalo.me/${yourZaloPhone}?text=${encodeURIComponent(msg)}`;

if(confirm('Đơn hàng đã tạo xong! Bấm OK để chuyển sang Zalo gửi đơn.')) {
    window.location.href = zaloUrl; 
}
}

//auto render cart on page load
document.addEventListener('DOMContentLoaded', renderCart);