/** Plain black page background with a very faint grid. */
export function ProteinBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(172,192,211,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(172,192,211,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-[40vh] bg-[radial-gradient(ellipse_at_top,rgba(9,161,161,0.08),transparent_70%)]" />
    </div>
  );
}
