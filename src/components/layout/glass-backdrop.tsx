/** Fixed, slowly drifting warm light behind the glass surfaces of the public site. */
export function GlassBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#fffaf6]">
      <div className="aurora-blob aurora-a" />
      <div className="aurora-blob aurora-b" />
      <div className="aurora-blob aurora-c" />
      {/* Soft vignette so content stays readable over the light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(255_255_255/0.55),rgb(255_255_255/0)_70%)]" />
    </div>
  );
}
