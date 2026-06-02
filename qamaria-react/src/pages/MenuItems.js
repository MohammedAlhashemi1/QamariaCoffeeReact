import { useState, useEffect } from 'react';
import '../theme.css';
import './MenuItems.css';

function MenuItems() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => { loadItems(); }, []);

  function loadItems() {
    fetch('https://localhost:7105/api/menuitems')
      .then(res => res.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }

  function handleAddClick() {
    setEditItem(null);
    setItemName(''); setDescription(''); setPrice(''); setCategory('');
    setShowForm(true);
  }

  function handleEditClick(item) {
    setEditItem(item);
    setItemName(item.itemName); setDescription(item.description);
    setPrice(item.price); setCategory(item.category);
    setShowForm(true);
  }

  function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    fetch(`https://localhost:7105/api/menuitems/${id}`, { method: 'DELETE' })
      .then(() => loadItems()).catch(console.log);
  }

  function handleSubmit() {
    const item = { itemName, description, price: parseFloat(price), category };
    if (editItem) {
      fetch(`https://localhost:7105/api/menuitems/${editItem.itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, itemId: editItem.itemId })
      }).then(() => { setShowForm(false); loadItems(); }).catch(console.log);
    } else {
      fetch('https://localhost:7105/api/menuitems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }).then(() => { setShowForm(false); loadItems(); }).catch(console.log);
    }
  }

  const totalItems = items.length;
  const drinks     = items.filter(i => i.category?.toLowerCase() === 'drink').length;
  const foods      = items.filter(i => i.category?.toLowerCase() === 'food').length;
  const avgPrice   = totalItems > 0
    ? (items.reduce((s, i) => s + (i.price || 0), 0) / totalItems).toFixed(2)
    : '0.00';

  return (
    <div className="coffee-page">

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-icon">🍵</span>
          <div>
            <h1>Menu Items</h1>
            <p>Manage your coffee & food offerings</p>
          </div>
        </div>
        <button className="btn-coffee" onClick={handleAddClick}>+ Add Item</button>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="summary-grid">
          <div className="summary-card"><div className="s-label">Total Items</div><div className="s-value">{totalItems}</div></div>
          <div className="summary-card"><div className="s-label">Drinks</div><div className="s-value">{drinks}</div></div>
          <div className="summary-card"><div className="s-label">Food</div><div className="s-value">{foods}</div></div>
          <div className="summary-card"><div className="s-label">Avg Price</div><div className="s-value">${avgPrice}</div></div>
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <h4>{editItem ? '✏️ Edit Item' : '🍵 Add New Item'}</h4>
          </div>
          <div className="form-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Item Name</label>
                <input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Caramel Latte" />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">Select…</option>
                  <option value="Drink">Drink</option>
                  <option value="Food">Food</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description…" />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-save" onClick={handleSubmit}>Save Item</button>
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="data-card">
        <div className="data-card-header">
          <h2>🍵 Menu</h2>
          {!loading && <span className="count-badge">{totalItems} items</span>}
        </div>

        {loading ? (
          <div className="page-loading">
            <div className="coffee-spinner">☕</div>
            <p>Loading the menu…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="page-empty">
            <div className="empty-icon">📋</div>
            <h3>Menu is empty</h3>
            <p>Add your first item to get started.</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.itemId}>
                    <td><strong>{item.itemName}</strong></td>
                    <td>
                      <span className={`chip ${item.category?.toLowerCase() === 'drink' ? 'chip-drink' : 'chip-food'}`}>
                        {item.category?.toLowerCase() === 'drink' ? '☕' : '🥐'} {item.category}
                      </span>
                    </td>
                    <td><strong className="item-price">${item.price}</strong></td>
                    <td className="item-description">{item.description}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-edit" onClick={() => handleEditClick(item)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(item.itemId)}>Delete</button>
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

export default MenuItems;
