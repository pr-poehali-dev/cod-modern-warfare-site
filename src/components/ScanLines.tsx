const ScanLines = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="scanlines absolute inset-0" />
      <div className="scan-beam absolute inset-0" />
      <div className="vignette absolute inset-0" />
    </div>
  );
};

export default ScanLines;
