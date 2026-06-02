import { useState, useEffect } from 'react';
import '../theme.css';
import './Locations.css';

function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://localhost:7105/api/locations')
      .then(res => res.json())
      .then(data => { setLocations(data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }, []);

  return (
    <div className="coffee-page">

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-icon">📍</span>
          <div>
            <h1>Locations</h1>
            <p>All Qamaria Coffee branches</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="summary-grid">
          <div className="summary-card">
            <div className="s-label">Total Branches</div>
            <div className="s-value">{locations.length}</div>
          </div>
          <div className="summary-card">
            <div className="s-label">Cities</div>
            <div className="s-value">{new Set(locations.map(l => l.city)).size}</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="data-card">
        <div className="data-card-header">
          <h2>📍 Branch Directory</h2>
          {!loading && <span className="count-badge">{locations.length} locations</span>}
        </div>

        {loading ? (
          <div className="page-loading">
            <div className="coffee-spinner">☕</div>
            <p>Finding our locations…</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="page-empty">
            <div className="empty-icon">🗺️</div>
            <h3>No locations found</h3>
            <p>No branches have been added yet.</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>Address</th>
                  <th>City</th>
                </tr>
              </thead>
              <tbody>
                {locations.map(location => (
                  <tr key={location.locationId}>
                    <td><strong>{location.locationName}</strong></td>
                    <td className="location-address">{location.address}</td>
                    <td><span className="chip chip-cream">🏙️ {location.city}</span></td>
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

export default Locations;
