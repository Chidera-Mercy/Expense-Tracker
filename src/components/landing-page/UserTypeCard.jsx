export default function UserTypeCard({ icon, title, subtitle, selected }) {
    return (
      <div className={`bg-emerald-800 p-6 rounded-lg relative ${selected ? 'ring-2 ring-emerald-400' : ''}`}>
        <div className="absolute top-4 left-4">
          <div className={`w-6 h-6 rounded-full border-2 ${selected ? 'border-emerald-400 bg-emerald-400' : 'border-white'}`}></div>
        </div>
        <div className="flex flex-col items-center pt-8">
          <div className="text-4xl mb-4">{icon}</div>
          <h3 className="text-center font-medium">{title}</h3>
          {subtitle && <p className="text-center text-sm text-emerald-300">{subtitle}</p>}
        </div>
      </div>
    );
  }