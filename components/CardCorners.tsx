/** Four viewfinder brackets. Pure markup — MotionEngine snaps them onto
 *  the card after it lands, and CSS pulls them outward on hover. */
export default function CardCorners() {
  return (
    <>
      <i className="card-corner tl" aria-hidden="true" />
      <i className="card-corner tr" aria-hidden="true" />
      <i className="card-corner bl" aria-hidden="true" />
      <i className="card-corner br" aria-hidden="true" />
    </>
  );
}
