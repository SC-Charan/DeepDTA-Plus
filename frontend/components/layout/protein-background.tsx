export function ProteinBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#06070D] via-[#0A0D1A] to-[#0F0820]" />

      {/* Orb 1 — violet */}
      <div className="absolute -top-[15%] -left-[10%] w-[65vw] h-[65vw] max-w-[900px] max-h-[900px] rounded-full bg-[#8B5CF6]/25 blur-[120px] animate-orb-1" />

      {/* Orb 2 — pink */}
      <div className="absolute top-[25%] -right-[15%] w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] rounded-full bg-[#EC4899]/20 blur-[120px] animate-orb-2" />

      {/* Orb 3 — cyan */}
      <div className="absolute -bottom-[20%] left-[15%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-[#06B6D4]/15 blur-[120px] animate-orb-3" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(248,250,252,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(248,250,252,0.025) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06070D]/0 via-transparent to-[#06070D]/60" />
    </div>
  );
}
