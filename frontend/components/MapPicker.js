'use client';

import dynamic from 'next/dynamic';

const MapPickerInner = dynamic(() => import('./MapPickerInner'), { ssr: false });

export default function MapPicker(props) {
  return <MapPickerInner {...props} />;
}
