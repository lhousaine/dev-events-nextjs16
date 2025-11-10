import { Suspense } from 'react';
import EventDetails from '@/components/EventDetails';
import { cacheLife } from 'next/cache';

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  'use cache';
  cacheLife('hours');

  const slug = params.then((p) => p.slug);

  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <EventDetails params={slug} />
      </Suspense>
    </main>
  );
};
export default EventDetailsPage;
