'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

export default function Features() {
  const featuresData = [
    {
      image: 'text-conversation',
      title: 'Smart Text Conversations',
      description: 'Enjoy natural, intelligent conversations with our advanced text-based AI. Peter responds with context awareness and thoughtful answers.'
    },
    {
      image: 'voice-interaction',
      title: 'Voice Interaction',
      description: 'Speak directly to AI Peter and hear responses in a natural voice. Experience seamless voice-to-text and text-to-voice conversion.'
    },
    {
      image: 'share-conversation',
      title: 'Shareable Conversations',
      description: 'Share your AI conversations with friends via custom links. Let others view your insightful discussions with Peter.'
    },
    {
      image: 'realtime-response',
      title: 'Real-time Responses',
      description: 'Experience lightning-fast AI responses with minimal latency. Watch as Peter thinks and responds with animated typing indicators.'
    },
    {
      image: 'dark-mode',
      title: 'Premium Dark Mode',
      description: "Enjoy the sleek black and white futuristic design that's easy on the eyes and gives a premium user experience."
    },
    {
      image: 'modern-design',
      title: 'Modern UI/UX Design',
      description: 'Navigate through a beautifully designed interface with smooth animations and intuitive controls for the best user experience.'
    }
  ];

  const featureAnimation = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <section id="features" className="py-20 dark:bg-black bg-white relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent blur-[100px] rounded-full" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-accent-light bg-clip-text text-transparent"
          >
            Futuristic Features
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            Experience the next generation of AI interaction with these cutting-edge features
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => {
            const [ref, inView] = useInView({
              triggerOnce: true,
              threshold: 0.1,
            });

            return (
              <motion.div
                key={index}
                ref={ref}
                custom={index}
                variants={featureAnimation}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="bg-dark-800/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm hover:bg-dark-800/80 transition-all duration-300 hover:shadow-glow group"
              >
                <div className="mb-4 w-16 h-16 mx-auto">
                  <Image 
                    src={`/images/features/${feature.image}.svg`} 
                    alt={feature.title}
                    width={120}
                    height={120}
                    className="w-full h-full transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-accent transition-colors text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-center">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 max-w-4xl mx-auto bg-gradient-to-br from-dark-800/80 to-dark-900/80 rounded-2xl p-8 border border-white/5 shadow-glow text-center"
        >
          <h3 className="text-2xl font-semibold mb-4 text-white">
            Powered by Advanced AI Technology
          </h3>
          <p className="text-gray-400 mb-6">
            AI Peter uses the latest deep learning models to deliver intelligent conversations, natural language processing, and context-aware responses for the most human-like AI experience.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-mono">
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full">Natural Language Processing</span>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full">Context Awareness</span>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full">Voice Recognition</span>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full">Neural Networks</span>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full">Deep Learning</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
