import { fetchAdvisorProfile } from '../../lib/api';
import MicrositeShell from '../../components/MicrositeShell';

export default async function AdvisorLayout({ children, params }) {
  const data = await fetchAdvisorProfile(params.advisorSlug);

  return <MicrositeShell initialAdvisor={data?.advisor || null}>{children}</MicrositeShell>;
}
