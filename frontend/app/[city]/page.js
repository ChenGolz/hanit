import CityPageClient from '../../components/CityPageClient';
import { cityPages } from '../../components/translations';

export const dynamicParams = false;

export function generateStaticParams() {
  return cityPages.map(({ slug }) => ({ city: slug }));
}

export default function CityPage({ params }) {
  return <CityPageClient citySlug={params.city} />;
}
