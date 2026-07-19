import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins'
});

export const metadata = {
  title: 'InsuranceAdvise.in — India\'s Trusted Insurance Education Platform',
  description: 'Connect with verified insurance advisors across India, or grow your own advisory practice with a professional online presence.',
  verification: {
    google: 'RBoDIx_309fEiViL_fZH0EsUCVxWCG8R_sIMGNTNVxY'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`scroll-smooth ${poppins.variable}`}>
      <body className="bg-gray-50 font-sans antialiased">{children}</body>
    </html>
  );
}
