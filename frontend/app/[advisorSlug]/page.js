import { notFound } from 'next/navigation';
import { fetchAdvisorProfile, fetchAdvisorTestimonials, fetchAdvisorContent } from '../../lib/api';
import AdvisorHomeView from '../../components/AdvisorHomeView';

export default async function AdvisorHomePage({ params }) {
  const data = await fetchAdvisorProfile(params.advisorSlug);

  if (!data) {
    notFound();
  }

  const { testimonials } = await fetchAdvisorTestimonials(params.advisorSlug);
  const { posts } = await fetchAdvisorContent(params.advisorSlug);

  return (
    <AdvisorHomeView
      advisorSlug={params.advisorSlug}
      initialAdvisor={data.advisor}
      initialTestimonials={testimonials}
      initialPosts={posts}
    />
  );
}
