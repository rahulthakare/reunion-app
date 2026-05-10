export default function AdminDashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Manage the <strong>NEHS Wardha — Batch &apos;93</strong> reunion: events, RSVPs, attendees, and photos.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="card">
          <div className="text-2xl mb-1">📅</div>
          <h2 className="text-sm font-medium text-gray-500">Events</h2>
          <p className="text-3xl font-bold text-indigo-600">—</p>
          <p className="text-xs text-gray-400 mt-1">Scheduled events</p>
        </div>
        <div className="card">
          <div className="text-2xl mb-1">🙋</div>
          <h2 className="text-sm font-medium text-gray-500">RSVPs</h2>
          <p className="text-3xl font-bold text-indigo-600">—</p>
          <p className="text-xs text-gray-400 mt-1">Confirmed attendees</p>
        </div>
        <div className="card">
          <div className="text-2xl mb-1">👥</div>
          <h2 className="text-sm font-medium text-gray-500">Batchmates</h2>
          <p className="text-3xl font-bold text-indigo-600">—</p>
          <p className="text-xs text-gray-400 mt-1">Registered profiles</p>
        </div>
        <div className="card">
          <div className="text-2xl mb-1">🖼️</div>
          <h2 className="text-sm font-medium text-gray-500">Photos</h2>
          <p className="text-3xl font-bold text-indigo-600">—</p>
          <p className="text-xs text-gray-400 mt-1">Shared memories</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a href="/admin/agenda" className="card flex items-start gap-4 hover:border-indigo-200 transition-colors">
            <div className="text-2xl">📋</div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Agenda</h3>
              <p className="text-sm text-gray-500 mt-0.5">Edit the day&apos;s schedule</p>
            </div>
          </a>
          <a href="/admin/attendees" className="card flex items-start gap-4 hover:border-indigo-200 transition-colors">
            <div className="text-2xl">👥</div>
            <div>
              <h3 className="font-semibold text-gray-900">Attendees</h3>
              <p className="text-sm text-gray-500 mt-0.5">View and manage batchmate RSVPs</p>
            </div>
          </a>
          <a href="/admin/directory" className="card flex items-start gap-4 hover:border-indigo-200 transition-colors">
            <div className="text-2xl">📒</div>
            <div>
              <h3 className="font-semibold text-gray-900">Directory</h3>
              <p className="text-sm text-gray-500 mt-0.5">Manage batchmate contacts</p>
            </div>
          </a>
          <a href="/admin/gallery" className="card flex items-start gap-4 hover:border-indigo-200 transition-colors">
            <div className="text-2xl">🖼️</div>
            <div>
              <h3 className="font-semibold text-gray-900">Photo Gallery</h3>
              <p className="text-sm text-gray-500 mt-0.5">Upload and manage memories</p>
            </div>
          </a>
          <a href="/fun-zone" className="card flex items-start gap-4 hover:border-indigo-200 transition-colors">
            <div className="text-2xl">🎉</div>
            <div>
              <h3 className="font-semibold text-gray-900">Fun Zone</h3>
              <p className="text-sm text-gray-500 mt-0.5">Play &amp; moderate games</p>
            </div>
          </a>
          <a href="/admin/articles" className="card flex items-start gap-4 hover:border-indigo-200 transition-colors">
            <div className="text-2xl">📰</div>
            <div>
              <h3 className="font-semibold text-gray-900">Articles</h3>
              <p className="text-sm text-gray-500 mt-0.5">Review and publish submissions</p>
            </div>
          </a>
          <a href="/admin/committees" className="card flex items-start gap-4 hover:border-indigo-200 transition-colors">
            <div className="text-2xl">👥</div>
            <div>
              <h3 className="font-semibold text-gray-900">Committees</h3>
              <p className="text-sm text-gray-500 mt-0.5">Organize volunteers into teams</p>
            </div>
          </a>
        </div>
      </div>

      {/* Reunion info banner */}
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-6 py-5 flex items-center gap-4">
        <div className="text-3xl">🎓</div>
        <div>
          <p className="font-bold text-indigo-900">New English High School, Wardha</p>
          <p className="text-indigo-600 text-sm">Batch of 1993 — 30+ Year Reunion</p>
        </div>
      </div>
    </div>
  );
}
