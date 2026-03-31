'use client';

import dynamic from 'next/dynamic';

const HeatMapInner = dynamic(() => import('./HeatMapInner'), { ssr: false });

export default function HeatMap(props) {
  return <HeatMapInner {...props} />;
}
