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

// --- 5. THANH TOÁN & GỬI ZALO (ĐÃ SỬA LỖI HIỂN THỊ) ---
function handleCheckout(e) {
    e.preventDefault();
    
    // 1. Kiểm tra giỏ hàng
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    if (cart.length === 0) {
        alert('Giỏ hàng đang trống!');
        return;
    }

    // 2. Lấy thông tin khách hàng
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    if (phone.length < 10) {
        alert("Vui lòng nhập số điện thoại hợp lệ!");
        return;
    }

    // 3. Soạn nội dung tin nhắn (Dùng ký tự xuống dòng %0A cho URL an toàn)
    // Lưu ý: Zalo đôi khi kén ký tự đặc biệt, nên soạn đơn giản nhất có thể.
    let msg = `DON HANG MOI!`;
    msg += `\n- Khach: ${name}`;
    msg += `\n- SDT: ${phone}`;
    msg += `\n- Dia chi: ${address}`;
    msg += `\n----------------`;
    msg += `\nDANH SACH MUA:`;
    
    let total = 0;
    cart.forEach(item => {
        msg += `\n+ ${item.name} (x${item.quantity}): ${formatCurrency(item.price * item.quantity)}`;
        total += item.price * item.quantity;
    });
    
    msg += `\n----------------`;
    msg += `\nTONG CONG: ${formatCurrency(total)}`;

    // 4. Lưu đơn hàng vào LocalStorage (để xem ở trang Manage)
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

    // 5. Xóa giỏ hàng sau khi chốt
    localStorage.removeItem(CART_KEY);

    // --- QUAN TRỌNG: CẤU HÌNH GỬI ZALO ---
    
    // BƯỚC A: Điền số điện thoại chủ shop (Bắt buộc dùng 84 ở đầu, bỏ số 0)
    // Ví dụ: Số 0397768941 -> Viết là 84397768941
    const yourZaloPhone = '84397768941'; 

    // BƯỚC B: Mã hóa tin nhắn để truyền qua URL không bị lỗi
    const encodedMsg = encodeURIComponent(msg);
    
    // BƯỚC C: Tạo link
    const zaloUrl = `https://zalo.me/${yourZaloPhone}?text=${encodedMsg}`;

    // 6. Chuyển hướng sang Zalo
    if(confirm('Đơn hàng đã tạo xong! Bấm OK để chuyển sang Zalo gửi đơn cho Shop.')) {
        window.location.href = zaloUrl; 
    }
}
