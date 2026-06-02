# Qamaria Coffee API + React
### Full Stack Project Documentation — Project 2
**Developer:** Mohammed Al-Hashemi  
**Stack:** ASP.NET Web API | EF Core | SQL Server | React  
**Started:** June 2026

---

## How Project 2 Differs from Project 1

| | Project 1 — MVC | Project 2 — API + React |
|---|---|---|
| Architecture | Monolithic (1 project) | Separated (2 projects) |
| Frontend | Razor Views (C# + HTML) | React (JavaScript) |
| Backend returns | Full HTML page | JSON data only |
| Controller base | `Controller` | `ControllerBase` |
| HTTP methods | GET + POST only | GET, POST, PUT, DELETE |
| Async | No | Yes |
| Validation | Manual `ModelState.IsValid` | Automatic via `[ApiController]` |
| After save | Redirect to page | Return status code |
| Who handles UI | ASP.NET (server) | React (browser) |
| Can serve multiple frontends | No | Yes |
| Testing tool | Browser | Swagger |

---

## The Big Picture

**Project 1 flow:**
```
Browser → ASP.NET MVC → Database → Razor View → HTML → Browser
```

**Project 2 flow:**
```
React → ASP.NET API → Database → JSON → React → Display
```

**Restaurant analogy:**
- Project 1 = waiter brings you a fully plated meal 🍽️
- Project 2 = kitchen sends raw ingredients 🥩 — React decides how to plate it

**Why Project 2 is better for big apps:**
- One API can serve multiple frontends (website, mobile app, other companies)
- Frontend and backend teams can work independently
- More scalable and maintainable

---

## Project Structure

```
QamariaCoffeeAPI/          ← BACKEND (ASP.NET Web API)
├── Controllers/            ← API endpoints (returns JSON)
├── Models/                 ← EF Core models (same as Project 1)
├── appsettings.json        ← connection string
└── Program.cs              ← startup config

qamaria-react/             ← FRONTEND (React)
└── src/
    ├── components/         ← reusable UI pieces
    ├── pages/              ← full pages
    └── App.js              ← main app file
```

---

## Step by Step — How We Built It

### ✅ Step 1 — Create ASP.NET Web API Project
- Template: **ASP.NET Core Web API** (not MVC!)
- Framework: .NET 8.0
- Project name: `QamariaCoffeeAPI`
- Enable OpenAPI (Swagger) support ✅

---

### ✅ Step 2 — Install NuGet Packages
```
Install-Package Microsoft.EntityFrameworkCore.SqlServer -Version 8.0.0
Install-Package Microsoft.EntityFrameworkCore.Tools -Version 8.0.0
```

---

### ✅ Step 3 — Scaffold Database
Same command as Project 1 — same database, new project:
```
Scaffold-DbContext "Server=localhost;Database=QamariaCoffeeDb;Trusted_Connection=True;TrustServerCertificate=True;" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models -Force
```

---

### ✅ Step 4 — Configure appsettings.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "YOUR_CONNECTION_STRING_HERE"
  }
}
```

Create `appsettings.Development.json` with real connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=QamariaCoffeeDb;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

---

### ✅ Step 5 — Configure Program.cs
Two things added compared to Project 1:
1. Register DbContext (same as Project 1)
2. Add CORS — allows React app to call this API

```csharp
using Microsoft.EntityFrameworkCore;
using QamariaCoffeeAPI.Models;

namespace QamariaCoffeeAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(); // enables Swagger testing page

            // Register DbContext — same as Project 1
            builder.Services.AddDbContext<QamariaCoffeeDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // CORS — allows React (localhost:3000) to call this API (localhost:7105)
            // Without this the browser blocks cross-origin requests
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReact", policy =>
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
            });

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(); // Swagger UI at /swagger
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowReact"); // enable CORS
            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
    }
}
```

**What is CORS?**
When React on `localhost:3000` calls API on `localhost:7105` the browser blocks it by default — different ports = different "origins". CORS tells the browser "this is allowed". Without it you'd get: `Access to fetch has been blocked by CORS policy`

---

### ✅ Step 6 — Build API Controllers

**IMPORTANT: Always use "API Controller - Empty" not "MVC Controller - Empty"**
- MVC Controller - Empty → inherits `Controller` → for Razor Views
- API Controller - Empty → inherits `ControllerBase` → for REST APIs ✅

#### Controller Comparison:

**Project 1 MVC Controller:**
```csharp
public class MenuItemsController : Controller  // has View support
{
    public IActionResult Index()
    {
        var items = _db.MenuItems.ToList();
        return View(items); // returns HTML page
    }
}
```

**Project 2 API Controller:**
```csharp
[ApiController]           // automatic validation, JSON responses
[Route("api/[controller]")] // URL = /api/menuitems
public class MenuItemsController : ControllerBase // no View support needed
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MenuItem>>> GetMenuItems()
    {
        return await _context.MenuItems.ToListAsync(); // returns JSON
    }
}
```

---

#### MenuItemsController.cs
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QamariaCoffeeAPI.Models;

namespace QamariaCoffeeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuItemsController : ControllerBase
    {
        private readonly QamariaCoffeeDbContext _context;

        public MenuItemsController(QamariaCoffeeDbContext context)
        {
            _context = context;
        }

        [HttpGet] // GET /api/menuitems — get all items
        public async Task<ActionResult<IEnumerable<MenuItem>>> GetMenuItems()
        {
            return await _context.MenuItems.ToListAsync();
        }

        [HttpGet("{id}")] // GET /api/menuitems/1 — get one item
        public async Task<ActionResult<MenuItem>> GetMenuItem(int id)
        {
            var item = await _context.MenuItems.FindAsync(id);
            if (item == null) return NotFound(); // 404
            return item; // 200 with JSON
        }

        [HttpPost] // POST /api/menuitems — create item
        public async Task<ActionResult<MenuItem>> CreateMenuItem(MenuItem item)
        {
            _context.MenuItems.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMenuItem), new { id = item.ItemId }, item); // 201 Created
        }

        [HttpPut("{id}")] // PUT /api/menuitems/1 — update item
        public async Task<IActionResult> UpdateMenuItem(int id, MenuItem item)
        {
            if (id != item.ItemId) return BadRequest(); // 400
            _context.Entry(item).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.MenuItems.Any(e => e.ItemId == id)) return NotFound();
                throw;
            }
            return NoContent(); // 204 success
        }

        [HttpDelete("{id}")] // DELETE /api/menuitems/1 — delete item
        public async Task<IActionResult> DeleteMenuItem(int id)
        {
            var item = await _context.MenuItems.FindAsync(id);
            if (item == null) return NotFound();
            _context.MenuItems.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent(); // 204 success
        }
    }
}
```

---

#### HTTP Status Codes Explained:
| Code | Name | Meaning | When used |
|---|---|---|---|
| 200 | OK | Success with data | GET requests |
| 201 | Created | Item was created | POST requests |
| 204 | No Content | Success, nothing to return | PUT, DELETE |
| 400 | Bad Request | Invalid data sent | ID mismatch etc. |
| 404 | Not Found | Item doesn't exist | Item not in DB |

---

#### Key Differences in Methods:

| | Project 1 | Project 2 |
|---|---|---|
| Get all | `return View(items)` | `return Ok(items)` |
| Create | `return RedirectToAction("Index")` | `return CreatedAtAction(...)` |
| Update | `[HttpPost]` | `[HttpPut]` |
| Delete | `[HttpPost]` | `[HttpDelete]` |
| After save | Redirect to page | Return status code |

**Why Project 1 used POST for everything:**
HTML forms only support GET and POST — they can't send PUT or DELETE. So Project 1 had to use POST for updates and deletes. React can send any HTTP method so Project 2 uses proper REST conventions.

---

#### Async/Await Explained:
```csharp
// Project 1 — synchronous (blocks the server while waiting)
var items = _db.MenuItems.ToList();

// Project 2 — asynchronous (server handles other requests while waiting)
var items = await _context.MenuItems.ToListAsync();
```
Think of it like ordering food:
- Synchronous = waiter stands at your table waiting for your order before serving anyone else
- Asynchronous = waiter takes your order then serves other tables while kitchen prepares yours

---

### ✅ Step 7 — Test with Swagger
- Run the app → browser opens at `/swagger`
- Shows all endpoints color coded by HTTP method
- Click any endpoint → "Try it out" → "Execute"
- See real JSON response from your database
- No frontend needed to test!

---

### 🔲 Step 8 — Create React App (Coming Next)
```bash
npx create-react-app qamaria-react
cd qamaria-react
npm start
```

React app runs on `localhost:3000`
API runs on `localhost:7105`
React calls API → displays data

---

## Key Concepts Learned

- **REST API** — set of rules for frontend/backend communication using HTTP methods
- **JSON** — data format APIs use to send data (like objects in JavaScript)
- **CORS** — browser security that blocks cross-origin requests, must be configured
- **Swagger** — auto-generated API testing page
- **Async/Await** — non-blocking code that handles multiple requests efficiently
- **ControllerBase vs Controller** — ControllerBase for APIs, Controller for MVC
- **HTTP Methods** — GET (read), POST (create), PUT (update), DELETE (delete)
- **Status Codes** — 200 OK, 201 Created, 204 No Content, 404 Not Found
- **CreatedAtAction** — proper REST response for POST, includes link to new resource
- **EntityState.Modified** — tells EF Core the entire entity has been updated

---

## Commands Reference
```bash
# Install packages
Install-Package Microsoft.EntityFrameworkCore.SqlServer -Version 8.0.0
Install-Package Microsoft.EntityFrameworkCore.Tools -Version 8.0.0

# Scaffold database
Scaffold-DbContext "Server=localhost;Database=QamariaCoffeeDb;Trusted_Connection=True;TrustServerCertificate=True;" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models -Force

# Create React app
npx create-react-app qamaria-react

# Run React app
cd qamaria-react
npm start
```

---

*Updated as project progresses*

---

## Project 3 — qamaria-react (React Frontend)

### What is React?
React is a JavaScript library for building user interfaces. Instead of writing plain HTML you write **components** — reusable pieces of UI.

**Compare to Project 1:**
| Project 1 MVC | Project 3 React |
|---|---|
| Razor Views (.cshtml) | Components (.js) |
| C# + HTML with @ | JavaScript + HTML with {} |
| Runs on server | Runs in browser |
| Full page reload | No page reload |
| Controller passes data | Component fetches data itself |

---

### Setup Commands
```bash
# Create React app
npx create-react-app qamaria-react

# Navigate into folder
cd qamaria-react

# Start the app
npm start

# Install React Router (multiple pages)
npm install react-router-dom

# Install Bootstrap
npm install bootstrap
```

---

### Project Structure
```
qamaria-react/
├── node_modules/     ← packages, never touch this
├── public/           ← index.html lives here
├── src/
│   ├── pages/
│   │   ├── MenuItems.js
│   │   ├── Customers.js
│   │   ├── Locations.js
│   │   └── Orders.js
│   ├── App.js        ← main component, routing lives here
│   ├── App.css       ← global styles
│   └── index.js      ← entry point, import Bootstrap here
├── package.json      ← like .csproj, lists dependencies
└── .gitignore        ← excludes node_modules from GitHub
```

---

### Key React Concepts

#### 1. Components
A component is just a JavaScript function that returns HTML (JSX):
```javascript
function MenuItems() {
    return (
        <div>
            <h1>Menu Items</h1>
        </div>
    );
}
export default MenuItems; // make available to other files
```
Compare to Project 1: like a Razor View but written in JavaScript

---

#### 2. JSX
HTML inside JavaScript — looks like HTML but has differences:
```javascript
// JSX uses className instead of class
<div className="container">

// Variables use {} instead of @
<td>{item.itemName}</td>

// Comments use {/* */}
{/* this is a comment */}
```
Compare to Project 1 Razor: `@item.ItemName` → `{item.itemName}`

---

#### 3. useState
Stores data in a component — when it changes the page automatically updates:
```javascript
const [items, setItems] = useState([]); // items = data, setItems = update function
const [showForm, setShowForm] = useState(false); // boolean to show/hide form
```
Compare to Project 1: controller passed data to View — here React manages it itself

---

#### 4. useEffect
Runs code when the component loads:
```javascript
useEffect(() => {
    loadItems(); // fetch data when page loads
}, []); // [] = run only once
```
Compare to Tim Hortons: `$(document).ready(function() { LoadItems(); })`

---

#### 5. fetch API
Calls your ASP.NET API:
```javascript
// GET request
fetch('https://localhost:7105/api/menuitems')
    .then(res => res.json())
    .then(data => setItems(data))
    .catch(err => console.log(err));

// POST request
fetch('https://localhost:7105/api/menuitems', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
})

// PUT request
fetch(`https://localhost:7105/api/menuitems/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
})

// DELETE request
fetch(`https://localhost:7105/api/menuitems/${id}`, {
    method: 'DELETE'
})
```
Compare to Tim Hortons: same as `CallAJAX()` with jQuery but modern JavaScript

---

#### 6. Conditional Rendering
Show/hide elements based on state:
```javascript
{showForm && (
    <div>Form goes here</div> // only shows when showForm is true
)}

{editItem ? 'Edit Item' : 'Add New Item'} // ternary operator
```
Compare to Project 1: had to navigate to separate Create/Edit pages

---

#### 7. map() — Looping in React
```javascript
{items.map(item => (
    <tr key={item.itemId}> // key is required!
        <td>{item.itemName}</td>
    </tr>
))}
```
Compare to Project 1 Razor: `@foreach (var item in Model) { <tr>...</tr> }`

---

#### 8. React Router
Multiple pages without full page reloads:
```javascript
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// In App.js
<BrowserRouter>
    <Link to="/menu">Menu</Link> // like <a href> but no page reload
    <Routes>
        <Route path="/menu" element={<MenuItems />} />
    </Routes>
</BrowserRouter>
```
Compare to Project 1: routing configured in Program.cs — here it's in JSX

---

#### 9. Controlled Inputs
React controls form input values:
```javascript
<input 
    value={itemName}                           // value comes from state
    onChange={e => setItemName(e.target.value)} // updates state on every keystroke
/>
```
Compare to jQuery: `$("#itemName").val()`

---

### App.js — Full Code
```javascript
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MenuItems from './pages/MenuItems';
import Customers from './pages/Customers';
import Locations from './pages/Locations';
import Orders from './pages/Orders';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      {/* Bootstrap dark navbar */}
      <nav className="navbar navbar-expand-sm navbar-dark bg-dark px-3">
        <span className="navbar-brand">☕ QamariaCoffee</span>
        <div className="navbar-nav">
          <Link className="nav-link text-light" to="/menu">Menu</Link>
          <Link className="nav-link text-light" to="/customers">Customers</Link>
          <Link className="nav-link text-light" to="/locations">Locations</Link>
          <Link className="nav-link text-light" to="/orders">Orders</Link>
        </div>
      </nav>

      {/* page content with Bootstrap container */}
      <div className="container mt-4">
        <Routes>
          <Route path="/menu" element={<MenuItems />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

---

### index.js — Import Bootstrap
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // add this line!

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

---

### CRUD Pattern in React
Every page follows the same pattern:

```javascript
// 1. State
const [items, setItems] = useState([]);
const [showForm, setShowForm] = useState(false);
const [editItem, setEditItem] = useState(null);

// 2. Load data on mount
useEffect(() => { loadItems(); }, []);

// 3. Load function
function loadItems() {
    fetch('https://localhost:7105/api/menuitems')
        .then(res => res.json())
        .then(data => setItems(data));
}

// 4. Handle add click — clear form, show it
function handleAddClick() {
    setEditItem(null);
    setShowForm(true);
}

// 5. Handle edit click — fill form, show it
function handleEditClick(item) {
    setEditItem(item);
    setShowForm(true);
}

// 6. Handle delete
function handleDelete(id) {
    if (!window.confirm('Are you sure?')) return;
    fetch(`https://localhost:7105/api/menuitems/${id}`, { method: 'DELETE' })
        .then(() => loadItems());
}

// 7. Handle submit — POST or PUT based on editItem
function handleSubmit() {
    if (editItem) {
        // PUT — update
        fetch(`https://localhost:7105/api/menuitems/${editItem.itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, itemId: editItem.itemId })
        }).then(() => { setShowForm(false); loadItems(); });
    } else {
        // POST — create
        fetch('https://localhost:7105/api/menuitems', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        }).then(() => { setShowForm(false); loadItems(); });
    }
}
```

---

### Circular Reference Fix
When API returns nested objects (Order → Customer → Orders → ...) it causes infinite JSON loop.

**Fix:** Use `.Select()` in the controller to flatten the response:
```csharp
.Select(o => new {
    orderId = o.OrderId,
    customerName = o.Customer.FirstName + " " + o.Customer.LastName, // flatten
    locationName = o.Location.LocationName // flatten
})
```

---

### Running Both Projects Together
React and API must both be running at the same time:

| Project | Tool | Command | URL |
|---|---|---|---|
| QamariaCoffeeAPI | Visual Studio | F5 | localhost:7105 |
| qamaria-react | VS Code terminal | npm start | localhost:3000 |

---

### What's Next to Learn
- **useContext** — share data between components
- **Error handling** — what if API is down?
- **Loading states** — spinner while data loads
- **Form validation** — check fields before submitting
- **TypeScript** — typed JavaScript
- **Authentication** — JWT login/register (separate project)

---

## Full Project Summary

| Project | Tech | Purpose | Port |
|---|---|---|---|
| QamariaCoffee | ASP.NET MVC | Management system (server rendered) | 7120 |
| QamariaCoffeeAPI | ASP.NET Web API | REST API backend | 7105 |
| qamaria-react | React | Modern frontend | 3000 |

---

*Documentation complete — June 2026*
