// Fixed, full-viewport warehouse photo backdrop shared by the customer-facing pages.
function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1c30]/45 via-white/60 to-[#f5f7fd]/85" />
    </div>
  );
}

export default PageBackground;
