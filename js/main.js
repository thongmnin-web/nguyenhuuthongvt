// --- CẤU HÌNH CHUNG ---
const CART_KEY = 'shop_cart'; // Tên khóa lưu trữ giỏ hàng
const ORDERS_KEY = 'shop_orders'; // Tên khóa lưu trữ đơn hàng

// --- HÀM ĐỊNH DẠNG TIỀN TỆ (VND) ---
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// --- CHỨC NĂNG 1: THÊM VÀO GIỎ (Dùng ở trang Catalog) ---
function addToCart(name, price, img) {
    // 1. Lấy giỏ hàng hiện tại từ bộ nhớ (nếu chưa có thì tạo mảng rỗng)
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    
    // 2. Kiểm tra xem sản phẩm đã có trong giỏ chưa
    let existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1; // Nếu có rồi thì tăng số lượng
    } else {
        // Nếu chưa thì thêm mới
        cart.push({ name: name, price: price, img: img, quantity: 1 });
    }
    
    // 3. Lưu ngược lại vào bộ nhớ
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    
    // 4. Thông báo
    alert(`Đã thêm "${name}" vào giỏ hàng!`);
}

// Hàm mua ngay (Thêm rồi chuyển trang luôn)
function buyNow(name, price, img) {
    addToCart(name, price, img);
    window.location.href = 'cart.html';
}

// --- CHỨC NĂNG 2: HIỂN THỊ GIỎ HÀNG (Dùng ở trang Cart) ---
function renderCart() {
    const cartBody = document.getElementById('cart-body');
    const totalPriceEl = document.getElementById('total-price');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const cartTable = document.querySelector('.cart-table');

    // Nếu không tìm thấy thẻ cart-body (nghĩa là không ở trang giỏ hàng) thì dừng
    if (!cartBody) return;

    // Lấy dữ liệu từ bộ nhớ
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

    // Xử lý khi giỏ hàng trống
    if (cart.length === 0) {
        cartTable.style.display = 'none'; // Ẩn bảng
        emptyMsg.style.display = 'block'; // Hiện thông báo trống
        if(totalPriceEl) totalPriceEl.innerText = '0đ';
        return;
    }

    // Xử lý khi có hàng
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

// --- CÁC HÀM PHỤ TRỢ ---

// Cập nhật số lượng khi bấm nút tăng giảm
function updateQuantity(index, newQty) {
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    newQty = parseInt(newQty);
    
    if (newQty < 1) newQty = 1;
    
    if (cart[index]) {
        cart[index].quantity = newQty;
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCart(); // Vẽ lại giao diện
    }
}

function handleCheckout(e) {
    e.preventDefault(); 
    
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    if (cart.length === 0) {
        alert('Giỏ hàng đang trống!');
        return;
    }

    // 1. Lấy thông tin
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    // 2. Tạo nội dung tin nhắn Zalo
    let msg = `👋 Có đơn hàng mới!\n`;
    msg += `👤 Tên: ${name}\n`;
    msg += `📞 SĐT: ${phone}\n`;
    msg += `🏡 Địa chỉ: ${address}\n`;
    msg += `----------------\n`;
    msg += `🛒 Đơn hàng:\n`;
    
    let total = 0;
    cart.forEach(item => {
        msg += `- ${item.name} x${item.quantity}: ${formatCurrency(item.price * item.quantity)}\n`;
        total += item.price * item.quantity;
    });
    
    msg += `----------------\n`;
    msg += `💰 TỔNG CỘNG: ${formatCurrency(total)}`;

    // 3. Lưu vào Manage (để xem lịch sử trên máy khách)
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

    // 4. Xóa giỏ hàng
    localStorage.removeItem(CART_KEY);

    // 5. Mở Zalo Chat với nội dung đơn hàng
    // Thay số điện thoại của bạn vào chỗ 0397768941 (bỏ số 0 đầu, giữ 84)
    // Ví dụ: Zalo của bạn là 0397768941 -> dùng 84397768941
    const yourZaloPhone = '84397768941'; 
    const zaloUrl = `https://zalo.me/${yourZaloPhone}?text=${encodeURIComponent(msg)}`;
    
    if(confirm('Đơn hàng đã được tạo! Bấm OK để gửi chi tiết qua Zalo cho Shop.')) {
        window.open(zaloUrl, '_blank');
        window.location.href = 'index.html';
    }
}