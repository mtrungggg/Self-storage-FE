import { useHome } from "../hooks/useHome";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Home() {
  const { facilities, goToStorageDetail } = useHome();

  return (
    <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <Header active="rent" subtitle="Kho tự an ninh" showExpandIcon />

      <main className="mx-auto max-w-[1280px] px-4 py-8 lg:px-6">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold leading-tight tracking-[-0.03em] text-[#0b1c30]">
            Find Storage Near You
          </h1>
        </div>

        <div className="mt-6 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#8996a9]">Location</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">location_on</span>
                <input
                  defaultValue="Austin, TX"
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-24 text-[13px] outline-none focus:border-[#3b82f6]"
                />
                <button type="button" className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md bg-[#eef4ff] px-2 py-1 text-[11px] font-semibold text-[#1d5fe5]">
                  <span className="material-symbols-outlined text-[14px]">my_location</span>
                  Locate
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#8996a9]">Move-in</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">calendar_month</span>
                <input
                  defaultValue="Oct 24, 2025"
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-4 text-[13px] outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#8996a9]">Term</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">event_repeat</span>
                <select className="w-full appearance-none rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-4 text-[13px] outline-none focus:border-[#3b82f6]">
                  <option>Month-to-month</option>
                  <option>Quarterly</option>
                  <option>Yearly</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-[10px] bg-[#0b1c30] px-6 py-3 text-[13px] font-bold text-white transition hover:bg-[#132741]"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Search
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#eef1f8] pt-4 text-[12px] font-semibold">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8996a9]">Size:</span>
            <span className="rounded-full bg-[#0b1c30] px-3 py-1 text-white">All (18)</span>
            <span className="rounded-full border border-[#dfe7f5] px-3 py-1 text-[#3a475a]">Small</span>
            <span className="rounded-full border border-[#dfe7f5] px-3 py-1 text-[#3a475a]">Medium</span>
            <span className="rounded-full border border-[#dfe7f5] px-3 py-1 text-[#3a475a]">Large</span>
            <span className="rounded-full border border-[#dfe7f5] px-3 py-1 text-[#3a475a]">Vehicle</span>

            <span className="mx-2 h-4 w-px bg-[#e6ebf5]" />

            <label className="flex items-center gap-1.5 text-[#3a475a]">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Climate
            </label>
            <label className="flex items-center gap-1.5 text-[#3a475a]">
              <input type="checkbox" className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Drive-up
            </label>
            <label className="flex items-center gap-1.5 text-[#3a475a]">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Smart Lock
            </label>
            <label className="flex items-center gap-1.5 text-[#3a475a]">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              50% Off
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-3 text-[12px] font-semibold text-[#3a475a]">
            <span>Sort:</span>
            <select className="rounded-md border border-[#dfe7f5] bg-white px-2 py-1.5 outline-none">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Highest Rated</option>
            </select>
            <span className="flex items-center gap-1 rounded-md border border-[#dfe7f5] bg-white p-1">
              <span className="material-symbols-outlined rounded bg-[#eef4ff] p-1 text-[16px] text-[#1d5fe5]">grid_view</span>
              <span className="material-symbols-outlined p-1 text-[16px] text-[#8996a9]">view_list</span>
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
          {facilities.map((f) => (
            <div key={f.id} className="overflow-hidden rounded-[14px] border border-[#dfe7f5] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.03)] transition hover:shadow-md">
              <div className="relative h-[160px] w-full bg-cover bg-center" style={{ backgroundImage: `url('${f.image}')` }}>
                <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#0b1c30]">
                  {f.badge} • {f.distance}
                </span>
                <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#0b1c30]">
                  <span className="material-symbols-outlined text-[13px] text-[#f4b740]">star</span>
                  {f.rating} ({f.reviews})
                </span>
              </div>

              <div className="p-4">
                <div className="text-[16px] font-bold text-[#0b1c30]">{f.name}</div>
                <div className="mt-1 text-[12px] text-[#8996a9]">{f.address}</div>

                <div className="mt-5 flex items-center justify-between border-t border-[#f0f3f8] pt-3.5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">From</div>
                    <div className="text-[17px] font-extrabold text-[#0b1c30]">{f.from}</div>
                  </div>
                  <button
                    onClick={goToStorageDetail}
                    className="flex items-center gap-1.5 rounded-[9px] bg-[#0b1c30] px-4 py-2 text-[13px] font-bold text-white transition hover:bg-[#132741]"
                  >
                    Reserve
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
