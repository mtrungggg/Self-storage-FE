export default function AccessUnitGallery({ slides, selectedIndex, onSelect }) {
  const slide = slides[selectedIndex] || slides[0];
  if (!slide) return null;

  return (
    <section className="relative bg-slate-900 text-white" aria-label="Storage units">
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          key={slide.media}
          src={slide.media}
          alt={slide.title}
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-sm text-slate-200">{selectedIndex + 1} / {slides.length}</p>
          <h2 className="mt-1 text-3xl font-bold">{slide.title}</h2>
          <p className="mt-2 text-sm text-slate-200">{slide.description}</p>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto p-3">
        {slides.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={index === selectedIndex}
            onClick={() => onSelect(item.id)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${index === selectedIndex ? "bg-white text-slate-900" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
          >
            {item.title}
          </button>
        ))}
      </div>
    </section>
  );
}
