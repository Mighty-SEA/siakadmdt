import { TrendingUp, Users, CalendarCheck, Wallet } from "lucide-react";

const stats = [
  {
    title: "Revenue",
    value: "Rp12.500.000",
    change: "+10.8%",
    icon: <Wallet className="w-5 h-5 text-white" />,
    bg: "bg-primary",
    badge: "badge-success",
    sub: "vs. Rp11.200.000 bulan lalu"
  },
  {
    title: "Siswa",
    value: "450",
    change: "+2.1%",
    icon: <Users className="w-5 h-5 text-white" />,
    bg: "bg-success",
    badge: "badge-success",
    sub: "vs. 441 bulan lalu"
  },
  {
    title: "Absensi",
    value: "98%",
    change: "+1.2%",
    icon: <CalendarCheck className="w-5 h-5 text-white" />,
    bg: "bg-warning",
    badge: "badge-success",
    sub: "Rata-rata bulan ini"
  },
  {
    title: "SPP & Infaq",
    value: "Rp8.200.000",
    change: "+8.5%",
    icon: <TrendingUp className="w-5 h-5 text-white" />,
    bg: "bg-secondary",
    badge: "badge-success",
    sub: "vs. Rp7.500.000 bulan lalu"
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 w-full p-2 sm:p-0">
      {/* Business Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="card bg-base-200 shadow-xl p-5 flex flex-col gap-3 rounded-2xl border border-primary/30 hover:scale-[1.03] transition-transform min-w-0">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-3 ${s.bg} shadow-lg flex items-center justify-center`}>
                {s.icon}
              </div>
              <div className="ml-auto text-xs font-semibold px-2 py-1 rounded badge badge-outline bg-base-200 text-success">
                {s.change}
              </div>
            </div>
            <div className="text-2xl font-bold mt-2 text-base-content">{s.value}</div>
            <div className="text-base-content text-sm font-medium">{s.title}</div>
            <div className="text-xs text-base-content/60">{s.sub}</div>
          </div>
        ))}
      </div>
      {/* Statistik & Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-base-200 shadow-xl p-6 col-span-2 rounded-2xl border border-primary/30 min-w-0">
          <div className="font-bold mb-3 text-lg text-base-content">Statistik Siswa per Tahun</div>
          <div className="w-full h-48 flex items-end gap-3">
            {/* Grafik batang dummy */}
            {[60, 80, 100, 90, 120, 140, 130].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-7 rounded-xl bg-primary" style={{height: h}}></div>
                <div className="text-xs mt-2 text-base-content">{2018 + i}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card bg-base-200 shadow-xl p-6 rounded-2xl border border-primary/30 min-w-0">
          <div className="font-bold mb-3 text-lg text-base-content">Rekap Absensi</div>
          <div className="w-full h-48 flex items-end">
            {/* Grafik garis dummy */}
            <svg width="100%" height="100%" viewBox="0 0 200 100">
              <polyline fill="none" stroke="#6366f1" strokeWidth="3" points="0,80 30,60 60,70 90,40 120,50 150,30 200,60" />
              <polyline fill="none" stroke="#a3e635" strokeWidth="2" points="0,90 30,80 60,80 90,60 120,70 150,50 200,80" />
            </svg>
          </div>
        </div>
      </div>
      {/* Tabel & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-base-200 shadow-xl p-6 col-span-2 rounded-2xl border border-primary/30 min-w-0 overflow-x-auto">
          <div className="font-bold mb-3 text-lg text-base-content">Transaksi Terbaru</div>
          <table className="table table-zebra rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-base-200 text-base-content">
                <th>Nama</th>
                <th>Tipe</th>
                <th>Nominal</th>
                <th>Tanggal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-primary/10 transition-colors text-base-content">
                <td>Ahmad Fauzi</td>
                <td>SPP</td>
                <td>Rp200.000</td>
                <td>10 Jun 2024</td>
                <td><span className="badge badge-success">Lunas</span></td>
              </tr>
              <tr className="hover:bg-primary/10 transition-colors text-base-content">
                <td>Siti Aminah</td>
                <td>Infaq</td>
                <td>Rp50.000</td>
                <td>09 Jun 2024</td>
                <td><span className="badge badge-warning">Pending</span></td>
              </tr>
              <tr className="hover:bg-primary/10 transition-colors text-base-content">
                <td>Rizki Maulana</td>
                <td>SPP</td>
                <td>Rp200.000</td>
                <td>08 Jun 2024</td>
                <td><span className="badge badge-success">Lunas</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="card bg-base-200 shadow-xl p-6 rounded-2xl border border-primary/30 min-w-0">
          <div className="font-bold mb-3 text-lg text-base-content">Quick Chat</div>
          <div className="flex flex-col gap-3">
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src="/window.svg" />
                </div>
              </div>
              <div className="chat-header font-semibold text-base-content">Admin <time className="text-xs opacity-50 ml-1">11:35</time></div>
              <div className="chat-bubble rounded-2xl text-base-content">Selamat datang di SIAKAD!</div>
            </div>
            <div className="chat chat-end">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
                  <img src="/window.svg" />
                </div>
              </div>
              <div className="chat-header font-semibold text-base-content">Anda <time className="text-xs opacity-50 ml-1">11:36</time></div>
              <div className="chat-bubble rounded-2xl text-base-content">Terima kasih, Admin!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 