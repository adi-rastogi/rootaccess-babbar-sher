import { Info } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="demo-banner flex items-center justify-center gap-2">
      <Info size={12} />
      DEMO MODE — All data is simulated for demonstration purposes. Not real environmental measurements.
    </div>
  );
}

