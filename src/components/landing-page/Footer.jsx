export default function Footer() {
    return (
      <footer className="bg-emerald-950 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-emerald-400 font-bold mb-4">Features</h3>
            <ul className="space-y-2">
              <li>Expense Management</li>
              <li>Income Management</li>
              <li> Reports</li>
              <li>Receipt Upload</li>
              <li>Budget Planning</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-emerald-400 font-bold mb-4">Get Started</h3>
            <ul className="space-y-2">
              <li><a href="/signup" className="hover:text-emerald-400">Create a new account</a></li>
              <li><a href="/login" className="hover:text-emerald-400">Log in</a></li>
            </ul>
            <div className="mt-6">
              <p className="text-sm">©2025 PennyPath, Inc.</p>
            </div>
          </div>
        </div>
      </footer>
    );
  }