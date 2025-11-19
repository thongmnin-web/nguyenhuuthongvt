const ORDERS_KEY = 'shop_orders';

function renderOrders() {
    const tableBody = document.querySelector('#orders-table tbody');
    const noOrdersMsg = document.getElementById('no-orders');
    
    let orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];

    if (orders.length === 0) {
        if(noOrdersMsg) noOrdersMsg.style.display = 'block';
        return;
    }

    let html = '';

    orders.slice().reverse().forEach(order => {

        let productList = order.items.map(item => 
            `- ${item.name} (x${item.quantity})`
        ).join('<br>');

        html += `
            <tr>
                <td>${order.date}</td>
                <td>${order.customer.name}</td>
                <td>${order.customer.address}</td>
                <td>${order.customer.phone}</td>
                <td>
                    ${productList}
                    <br><strong>Tổng: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}</strong>
                </td>
            </tr>
        `;
    });

    if(tableBody) tableBody.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderOrders);