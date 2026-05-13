import { Link, Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-5">
        React Router Demo
      </h1>

      <nav className="flex gap-5 mb-5">
        <Link
          to="/login"
          className="text-blue-500"
        >
          Login
        </Link>

        <Link
          to="/chat"
          className="text-blue-500"
        >
          Chat
        </Link>
      </nav>

      <hr className="mb-5" />

      {/* Aquí se renderizan las rutas hijas */}
      <Outlet />
    </div>
  );
}

export default App;