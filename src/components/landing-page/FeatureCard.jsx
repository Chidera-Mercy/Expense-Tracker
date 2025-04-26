export default function FeatureCard({ icon, title, description }) {
    return (
      <div className="bg-emerald-900 p-6 rounded-lg">
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-emerald-400">{title}</h3>
        <p className="text-emerald-100">{description}</p>
        <div className="mt-4">
          <a href="#" className="text-emerald-400 hover:text-emerald-300">Learn More</a>
        </div>
      </div>
    );
  }