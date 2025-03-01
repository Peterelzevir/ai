'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CallToAction() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div 
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.8) 0%, transparent 25%), radial-gradient(circle at 85% 30%, rgba(99, 102, 241, 0.8) 0%, transparent 25%)',
            backgroundSize: '80% 80%',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-accent-light bg-clip-text text-transparent"
          >
            Ready to experience next-gen AI conversation?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 mb-10 text-lg"
          >
            Start chatting with AI Peter today and discover the future of intelligent conversation assistants.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(99, 102, 241, 0.7)" }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-accent hover:bg-accent-light text-white rounded-full font-medium text-lg transition-all duration-300 shadow-glow"
              >
                Try AI Peter Now
              </motion.button>
            </Link>
            
            <p className="mt-4 text-sm text-gray-500">
              No sign-up required. Start chatting immediately.
            </p>
          </motion.div>
        </div>
        
        {/* Testimonials/Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid md:grid-cols-3 gap-8"
        >
          <div className="bg-dark-800/50 border border-white/5 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-white mb-2">1000+</div>
            <div className="text-gray-400">Conversations Daily</div>
          </div>
          
          <div className="bg-dark-800/50 border border-white/5 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-white mb-2">95%</div>
            <div className="text-gray-400">Satisfaction Rate</div>
          </div>
          
          <div className="bg-dark-800/50 border border-white/5 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-gray-400">Always Available</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}