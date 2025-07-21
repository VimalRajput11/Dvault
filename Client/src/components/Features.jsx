import React from 'react';
import { Shield, Link, Share2 } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: 'Encrypted Storage',
      description: 'Military-grade encryption protects your data with zero-knowledge architecture'
    },
    {
      icon: Link,
      title: 'Decentralized Access',
      description: 'No central authority controls your data - you hold the keys to your digital vault'
    },
    {
      icon: Share2,
      title: 'Smart Sharing',
      description: 'Share files securely with granular permissions and time-based access controls'
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Why Choose D-Vault?
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Built on cutting-edge blockchain technology with uncompromising security standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group animate-fade-in-up bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:transform hover:scale-105"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-cyan-500 transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;