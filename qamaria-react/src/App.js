import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import MenuItems from './pages/MenuItems';
import Customers from './pages/Customers';
import Locations from './pages/Locations';
import Orders from './pages/Orders';
import './App.css';

function App() {
  return (
    <BrowserRouter>

      <nav className="coffee-nav">
        <span className="nav-brand">☕ QamariaCoffee</span>
        <div className="nav-links">
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/customers">Customers</NavLink>
          <NavLink to="/locations">Locations</NavLink>
          <NavLink to="/orders">Orders</NavLink>
        </div>
      </nav>

      <div className="app-content">
        <Routes>
          <Route path="/menu"      element={<MenuItems />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/orders"    element={<Orders />} />
        </Routes>
      </div>

    </BrowserRouter>
  );
}

export default App;
