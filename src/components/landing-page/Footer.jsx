export default function Footer() {
    return (
      <footer className="bg-emerald-900 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-emerald-400 font-bold mb-4">Features</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-400">Expense Management</a></li>
              <li><a href="#" className="hover:text-emerald-400">Spend Management</a></li>
              <li><a href="#" className="hover:text-emerald-400">Expense Reports</a></li>
              <li><a href="#" className="hover:text-emerald-400">Receipt Scanning App</a></li>
              <li><a href="#" className="hover:text-emerald-400">Budget Planning</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-emerald-400 font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-400">Support</a></li>
              <li><a href="#" className="hover:text-emerald-400">Help Center</a></li>
              <li><a href="#" className="hover:text-emerald-400">Terms of Service</a></li>
              <li><a href="#" className="hover:text-emerald-400">Privacy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-emerald-400 font-bold mb-4">Learn more</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-400">About PennyPath</a></li>
              <li><a href="#" className="hover:text-emerald-400">Blog</a></li>
              <li><a href="#" className="hover:text-emerald-400">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-emerald-400 font-bold mb-4">Get Started</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-400">Create a new account</a></li>
              <li><a href="#" className="hover:text-emerald-400">Log in</a></li>
            </ul>
            <div className="mt-6">
              <p className="text-sm">©2025 PennyPath, Inc.</p>
            </div>
          </div>
        </div>
      </footer>
    );
  }