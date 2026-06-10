# Qamaria Coffee — Full Stack

A coffee shop management system built as a full-stack application with a React frontend and an ASP.NET Core Web API backend.

## Tech Stack

**Backend**
- ASP.NET Core Web API (.NET 8)
- Entity Framework Core 8
- SQL Server

**Frontend**
- React 18
- JavaScript (ES6+)
- CSS / Bootstrap

## Features

- Browse and manage the coffee menu (categories, prices, items)
- Manage customer profiles
- Track branch locations
- Place and view orders
- RESTful API consumed by the React frontend

## Project Structure

```
QamariaCoffeeReact/
├── QamariaCoffeeAPI/          # ASP.NET Core Web API backend
│   ├── Controllers/
│   ├── Models/
│   └── QamariaCoffeeAPI.sln
└── qamaria-react/             # React frontend
    ├── src/
    ├── public/
    └── package.json
```

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18+)
- SQL Server

### Backend

```bash
cd QamariaCoffeeAPI
# Update the connection string in appsettings.json
dotnet run
# API will be available at https://localhost:5001
```

### Frontend

```bash
cd qamaria-react
npm install
npm start
# App will be available at http://localhost:3000
```
