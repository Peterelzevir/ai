import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export const metadata = {
  title: 'AI Peter - Super Modern AI Chatbot',
  description: 'Experience the future of AI conversation with Peter, a super modern chatbot with text and voice capabilities.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} ${robotoMono.variable} font-sans min-h-screen flex flex-col bg-primary-900 text-primary-50`}>
        <Navbar />
        <main className="flex-grow mt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
