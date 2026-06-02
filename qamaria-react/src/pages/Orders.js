import { useState, useEffect } from 'react';
import '../theme.css';
import './Orders.css';

const PAYMENT_ICONS = { credit: '💳', debit: '🏦', cash: '💵' };

const STATUS_CLASS = {
  completed:  'status-completed',
  pending:    'status-pending',
  cancelled:  'status-cancelled',
  preparing:  'status-preparing',
  delivered:  'status-delivered',
};

function getStatusClass(status = '') {
  return STATUS_CLASS[status.toLowerCase()] ?? 'status-default';
}

function getPaymentIcon(method = '') {
  return PAYMENT_ICONS[method.toLowerCase()] ?? '💰';
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [customerId, setCustomerId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadOrders();
    loadDropdowns();
  }, []);

  function loadOrders() {
    fetch('https://localhost:7105/api/orders')
      .then(res => res.json())
      .then(data => { setOrders(data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }

  function loadDropdowns() {
    fetch('https://localhost:7105/api/customers').then(r => r.json()).then(setCustomers).catch(console.log);
    fetch('https://localhost:7105/api/locations').then(r => r.json()).then(setLocations).catch(console.log);
    fetch('https://localhost:7105/api/menuitems').then(r => r.json()).then(setMenuItems).catch(console.log);
  }

  function handleAddClick() {
    setCustomerId(''); setLocationId(''); setPaymentMethod('');
    setItemId(''); setQuantity(1);
    setShowForm(true);
  }

  function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    fetch(`https://localhost:7105/api/orders/${id}`, { method: 'DELETE' })
      .then(() => loadOrders()).catch(console.log);
  }

  function handleSubmit() {
    const url = `https://localhost:7105/api/orders?customerId=${customerId}&locationId=${locationId}&paymentMethod=${paymentMethod}&itemId=${itemId}&quantity=${quantity}`;
    fetch(url, { method: 'POST' })
      .then(() => { setShowForm(false); loadOrders(); })
      .catch(console.log);
  }

  const totalOrders     = orders.length;
  const completed       = orders.filter(o => o.status?.toLowerCase() === 'completed').length;
  const pending         = orders.filter(o => o.status?.toLowerCase() === 'pending').length;
  const uniqueLocations = new Set(orders.map(o => o.locationName)).size;

  return (
    <div className="coffee-page">

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-icon">📋</span>
          <div>
            <h1>Orders</h1>
            <p>Track and manage all customer orders</p>
          </div>
        </div>
        <button className="btn-coffee" onClick={handleAddClick}>☕ Place New Order</button>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="summary-grid">
          <div className="summary-card"><div className="s-label">Total Orders</div><div className="s-value">{totalOrders}</div></div>
          <div className="summary-card"><div className="s-label">Completed</div><div className="s-value">{completed}</div></div>
          <div className="summary-card"><div className="s-label">Pending</div><div className="s-value">{pending}</div></div>
          <div className="summary-card"><div className="s-label">Locations</div><div className="s-value">{uniqueLocations}</div></div>
        </div>
      )}

      {/* Place Order Form */}
      {showForm && (
        <div className="form-card">
          <div className="form-card-header"><h4>☕ Place New Order</h4></div>
          <div className="form-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Customer</label>
                <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
                  <option value="">Select Customer…</option>
                  {customers.map(c => <option key={c.customerId} value={c.customerId}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <select value={locationId} onChange={e => setLocationId(e.target.value)}>
                  <option value="">Select Location…</option>
                  {locations.map(l => <option key={l.locationId} value={l.locationId}>{l.locationName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="">Select…</option>
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div className="form-group">
                <label>Menu Item</label>
                <select value={itemId} onChange={e => setItemId(e.target.value)}>
                  <option value="">Select Item…</option>
                  {menuItems.map(item => <option key={item.itemId} value={item.itemId}>{item.itemName} — ${item.price}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-save" onClick={handleSubmit}>Place Order</button>
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="data-card">
        <div className="data-card-header">
          <h2>☕ Order History</h2>
          {!loading && <span className="count-badge">{totalOrders} orders</span>}
        </div>

        {loading ? (
          <div className="page-loading">
            <div className="coffee-spinner">☕</div>
            <p>Brewing your orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="page-empty">
            <div className="empty-icon">🫗</div>
            <h3>No orders yet</h3>
            <p>Orders will appear here once customers start placing them.</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.orderId}>
                    <td><span className="order-id">#{order.orderId}</span></td>
                    <td><strong>{order.customerName}</strong></td>
                    <td><span className="chip chip-cream">📍 {order.locationName}</span></td>
                    <td><span className="order-date">{new Date(order.orderDate).toLocaleDateString()}</span></td>
                    <td><span className="chip chip-latte">{getPaymentIcon(order.paymentMethod)} {order.paymentMethod}</span></td>
                    <td><span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-delete" onClick={() => handleDelete(order.orderId)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
