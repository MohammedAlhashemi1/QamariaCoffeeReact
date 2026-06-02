import { useState, useEffect } from 'react';
import '../theme.css';
import './Customers.css';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => { loadCustomers(); }, []);

  function loadCustomers() {
    fetch('https://localhost:7105/api/customers')
      .then(res => res.json())
      .then(data => { setCustomers(data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }

  function handleAddClick() {
    setEditCustomer(null);
    setFirstName(''); setLastName(''); setEmail(''); setPhone('');
    setShowForm(true);
  }

  function handleEditClick(customer) {
    setEditCustomer(customer);
    setFirstName(customer.firstName); setLastName(customer.lastName);
    setEmail(customer.email); setPhone(customer.phone);
    setShowForm(true);
  }

  function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    fetch(`https://localhost:7105/api/customers/${id}`, { method: 'DELETE' })
      .then(() => loadCustomers()).catch(console.log);
  }

  function handleSubmit() {
    const customer = { firstName, lastName, email, phone };
    if (editCustomer) {
      fetch(`https://localhost:7105/api/customers/${editCustomer.customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...customer, customerId: editCustomer.customerId })
      }).then(() => { setShowForm(false); loadCustomers(); }).catch(console.log);
    } else {
      fetch('https://localhost:7105/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      }).then(() => { setShowForm(false); loadCustomers(); }).catch(console.log);
    }
  }

  return (
    <div className="coffee-page">

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-icon">👥</span>
          <div>
            <h1>Customers</h1>
            <p>Manage customer accounts</p>
          </div>
        </div>
        <button className="btn-coffee" onClick={handleAddClick}>+ Add Customer</button>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="summary-grid">
          <div className="summary-card">
            <div className="s-label">Total Customers</div>
            <div className="s-value">{customers.length}</div>
          </div>
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <h4>{editCustomer ? '✏️ Edit Customer' : '👤 Add New Customer'}</h4>
          </div>
          <div className="form-body">
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-save" onClick={handleSubmit}>Save Customer</button>
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="data-card">
        <div className="data-card-header">
          <h2>👥 Customer List</h2>
          {!loading && <span className="count-badge">{customers.length} customers</span>}
        </div>

        {loading ? (
          <div className="page-loading">
            <div className="coffee-spinner">☕</div>
            <p>Loading customers…</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="page-empty">
            <div className="empty-icon">🫗</div>
            <h3>No customers yet</h3>
            <p>Add your first customer to get started.</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.customerId}>
                    <td><strong>{customer.firstName} {customer.lastName}</strong></td>
                    <td><span className="chip chip-cream">✉️ {customer.email}</span></td>
                    <td><span className="chip chip-latte">📞 {customer.phone}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-edit" onClick={() => handleEditClick(customer)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(customer.customerId)}>Delete</button>
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

export default Customers;
