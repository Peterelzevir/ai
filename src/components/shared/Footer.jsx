'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-white/10 py-8 dark:bg-black bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1">
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
            <p className="mt-4 text-sm text-gray-400 max-w-md">
              AI Peter is a super modern AI chatbot designed to provide natural conversations through text and voice interfaces.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-gray-400 hover:text-accent text-sm transition-colors">
                  Try AI Peter
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-gray-400 hover:text-accent text-sm transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
            <div className="flex space-x-4">
              <motion.a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-accent transition-colors"
              >
                <FiGithub size={18} />
              </motion.a>
              <motion.a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-accent transition-colors"
              >
                <FiTwitter size={18} />
              </motion.a>
              <motion.a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-accent transition-colors"
              >
                <FiLinkedin size={18} />
              </motion.a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-gray-500">
            © {currentYear} AI Peter. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}