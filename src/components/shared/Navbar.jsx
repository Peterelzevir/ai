'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Chat with AI Peter', path: '/chat' },
  ];

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
        ? 'py-2 bg-black/80 backdrop-blur-lg' 
        : 'py-4 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-white font-bold text-xl flex items-center">
          <motion.div
            initial={{ rotate: -5 }}
            animate={{ rotate: 5 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
            className="w-8 h-8 mr-2 bg-accent rounded-full flex items-center justify-center"
          >
            AI
          </motion.div>
          <span className="bg-gradient-to-r from-white to-accent-light bg-clip-text text-transparent">
            Peter
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              className={`
                relative text-sm font-medium transition-colors duration-300
                ${pathname === item.path ? 'text-accent' : 'text-white/80 hover:text-white'}
              `}
            >
              {item.name}
              {pathname === item.path && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-accent"
                  initial={false}
                />
              )}
            </Link>
          ))}
          
          <Link href="/chat">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-2 px-5 py-2 bg-accent text-white rounded-full text-sm font-medium transition-all"
            >
              Try AI Peter Now
            </motion.button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-black/95 absolute top-full left-0 w-full py-4 shadow-lg"
        >
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                href={item.path}
                onClick={closeMenu}
                className={`
                  text-sm font-medium py-2 transition-colors duration-300
                  ${pathname === item.path ? 'text-accent' : 'text-white/80'}
                `}
              >
                {item.name}
              </Link>
            ))}
            <Link href="/chat" onClick={closeMenu}>
              <button className="w-full py-3 bg-accent text-white rounded-md text-sm font-medium transition-all">
                Try AI Peter Now
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}