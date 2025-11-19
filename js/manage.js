const ORDERS_KEY = 'shop_orders';

// --- HÀM ĐỊNH DẠNG TIỀN ---
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// --- 1. HIỂN THỊ DANH SÁCH ĐƠN HÀNG ---
function renderOrders() {
    const tableBody = document.querySelector('#orders-table tbody');
    const noOrdersMsg = document.getElementById('no-orders');
    
    // Lấy danh sách đơn hàng từ bộ nhớ
    let orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];

    // Nếu chưa có đơn nào
    if (orders.length === 0) {
        if(noOrdersMsg) noOrdersMsg.style.display = 'block';
        if(tableBody) tableBody.innerHTML = ''; // Xóa trắng bảng
        return;
    }

    // Nếu có đơn hàng
    if(noOrdersMsg) noOrdersMsg.style.display = 'none';

    let html = '';
    
    // Duyệt ngược (slice().reverse()) để đơn mới nhất hiện lên trên cùng
    orders.slice().reverse().forEach(order => {
        
        // Tạo danh sách tên sản phẩm (xuống dòng cho đẹp)
        let productList = order.items.map(item => 
            `- ${item.name} <b>(x${item.quantity})</b>`
        ).join('<br>');

        html += `
            <tr>
                <td>${order.date}</td>
                <td><strong>${order.customer.name}</strong></td>
                <td>
                    ${order.customer.phone} <br>
                    <span style="color:#666; font-size:0.9rem;">${order.customer.address}</span>
                </td>
                <td>
                    ${productList}
                    <br><br>
                    <strong style="color:#0dec84;">Tổng: ${formatCurrency(order.totalPrice)}</strong>
                </td>
                <td style="text-align:center;">
                    <button onclick="deleteOrder(${order.id})" 
                            style="background: #ff4d4d; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        Đã giao / Xóa
                    </button>
                </td>
            </tr>
        `;
    });

    if(tableBody) tableBody.innerHTML = html;
}

// --- 2. HÀM XÓA ĐƠN HÀNG ---
function deleteOrder(orderId) {
    if (confirm('Bạn chắc chắn muốn xóa đơn hàng này? (Hành động này không thể hoàn tác)')) {
        // 1. Lấy danh sách cũ
        let orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
        
        // 2. Lọc ra danh sách mới (Bỏ qua đơn hàng có ID trùng khớp)
        let newOrders = orders.filter(order => order.id !== orderId);
        
        // 3. Lưu danh sách mới lại vào bộ nhớ
        localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
        
        // 4. Vẽ lại bảng ngay lập tức
        renderOrders();
    }
}

// Chạy khi tải trang (hoặc khi nhập đúng PIN từ manage.html)
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem hàm này được gọi từ đâu, nếu trang đã load xong thì chạy luôn
    renderOrders();
});