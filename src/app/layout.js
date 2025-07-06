import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Hello Business - Knowledge Architect',
  description: 'Creator de resurse acționabile pentru asistenți și agenți AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body className={inter.className}>{children}</body>
    </html>
  );
}