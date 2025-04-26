import { Link } from "react-router-dom";

export default function Header() {
    return (
      <header className="flex justify-between items-center p-6">
        <div className="text-3xl font-bold text-emerald-400">PennyPath</div>
        <div>
          <Link to="/login">
            <button className="bg-emerald-400 text-emerald-900 px-6 py-2 rounded-full font-medium">
              Sign In
            </button>
          </Link>
        </div>
      </header>
    );
  }