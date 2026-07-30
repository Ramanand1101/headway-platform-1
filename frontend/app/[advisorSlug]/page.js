import { notFound } from 'next/navigation';
import { fetchAdvisorProfile, fetchAdvisorTestimonials, fetchAdvisorContent, fetchSiteContent } from '../../lib/api';
import AdvisorHomeView from '../../components/AdvisorHomeView';

export default async function AdvisorHomePage({ params }) {
  const data = await fetchAdvisorProfile(params.advisorSlug);

  if (!data) {
    notFound();
  }

  const { testimonials } = await fetchAdvisorTestimonials(params.advisorSlug);
  const { posts } = await fetchAdvisorContent(params.advisorSlug);
  const advisorDefaults = await fetchSiteContent('advisor-defaults');

  return (
    <AdvisorHomeView
      advisorSlug={params.advisorSlug}
      initialAdvisor={data.advisor}
      initialTestimonials={testimonials}
      initialPosts={posts}
      advisorDefaults={advisorDefaults}
    />
  );
}
