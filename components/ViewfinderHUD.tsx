/**
 * Camera-viewfinder chrome for the mobile hero block: four corner
 * brackets, a blinking record dot and an exposure readout.
 *
 * Decorative only — hidden from assistive tech, and the readout is
 * static set dressing rather than anything the page measures.
 */
export default function ViewfinderHUD() {
  return (
    <div className="vf" aria-hidden="true">
      <i className="vf-corner tl" />
      <i className="vf-corner tr" />
      <i className="vf-corner bl" />
      <i className="vf-corner br" />

      <span className="vf-rec">
        <i className="vf-dot" />
        REC
      </span>

      <span className="vf-readout">ISO 400 · 1/250 · f/2.8</span>
    </div>
  );
}
