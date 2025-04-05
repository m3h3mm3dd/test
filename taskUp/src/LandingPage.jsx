import React, { useState, useEffect } from 'react';
import './index.css';


const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black dark:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between px-8 py-4 bg-white bg-opacity-90 backdrop-blur-xl dark:bg-black dark:bg-opacity-80 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mr-3 shadow-lg"
            style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
          <h1 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>TaskUp</h1>
        </div>
        <div className="flex items-center space-x-6">
          <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all duration-300">Features</a>
          <a href="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all duration-300">Sign In</a>
          <a href="/register" className="px-4 py-2 bg-blue-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            Get Started
          </a>
        </div>
      </header>

     
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h2 
              className="text-5xl font-bold leading-tight tracking-tight mb-6"
            >
              Focused work, <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">beautifully managed.</span>
            </h2>
            <p 
              className="text-xl text-gray-600 dark:text-gray-300 mb-8"
            >
              TaskUp helps teams organize projects, align on priorities, and get more done together. Simply get things done.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <a 
                href="/register" 
                className="relative overflow-hidden block px-8 py-3 bg-blue-500 text-white rounded-full font-medium text-lg shadow-md hover:shadow-lg transition-all duration-300 text-center hover:scale-105"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
                  backgroundImage: 'linear-gradient(135deg, #42a6ff 0%, #0072ff 100%)'
                }}
              >
                <span className="relative z-10">Start for free</span>
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
              </a>
            </div>
          </div>
          <div className="md:w-1/2">
            <div 
              style={{ 
                perspective: '1000px',
                transformStyle: 'preserve-3d',
                transform: `rotateY(${scrollY * 0.02}deg) rotateX(${scrollY * -0.02}deg)`,
                transition: 'transform 0.5s ease-out'
              }}
              className="relative w-full h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              {/* iOS-style Status Bar */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gray-100 dark:bg-gray-900 flex items-center justify-between px-4 z-10">
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">9:41</div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 dark:text-gray-400">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <div className="w-4 h-4">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 dark:text-gray-400">
                      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                    </svg>
                  </div>
                  <div className="w-6 h-3 bg-gray-600 dark:bg-gray-300 rounded-sm relative">
                    <div className="absolute top-0.5 left-0.5 bottom-0.5 right-1 bg-gray-100 dark:bg-gray-900 rounded-sm"></div>
                  </div>
                </div>
              </div>
              
              {/* App Interface */}
              <div className="absolute top-6 left-0 right-0 bottom-0 flex flex-col">
                {/* Navigation Bar */}
                <div className="h-12 bg-white dark:bg-gray-800 flex items-center px-4 border-b border-gray-200 dark:border-gray-700 z-10">
                  <div className="flex-1 text-center">
                    <div className="font-semibold text-blue-500">TaskUp</div>
                  </div>
                  <div className="absolute right-4 w-6 h-6">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-500">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                
                {/* Content Area with iOS-style design */}
                <div className="flex-1 flex">
                  {/* Sidebar - iOS style */}
                  <div className="w-1/4 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-3">
                    <div className="bg-blue-100 dark:bg-blue-800 rounded-full px-3 py-1.5 text-blue-600 dark:text-blue-100 font-medium text-sm mb-4 text-center">All Tasks</div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">Today</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">Important</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">Completed</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">Projects</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Content - iOS style */}
                  <div className="flex-1 p-3 bg-white dark:bg-gray-800 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Today's Tasks</h3>
                      <div className="text-blue-500 text-sm">Sort</div>
                    </div>
                    
                    {/* Task Items with iOS-style design */}
                    <div className="space-y-3">
                      {[
                        { title: "Prepare project proposal", time: "9:00 AM", done: true },
                        { title: "Client meeting", time: "11:30 AM", done: false },
                        { title: "Review designs", time: "2:00 PM", done: false }
                      ].map((task, i) => (
                        <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm flex items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${task.done ? 'bg-blue-500' : 'border-2 border-gray-300 dark:border-gray-500'}`}>
                            {task.done && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium ${task.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                              {task.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {task.time}
                            </div>
                          </div>
                          <div className="w-6 h-6 text-gray-400">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M9 4l-1 1v14l1 1h8l1-1V5l-1-1H9z" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-lg mb-3">Upcoming</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm">
                          <div className="font-medium text-gray-800 dark:text-gray-100">Team Sync</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Tomorrow, 10:00 AM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Tab Bar - iOS style */}
                <div className="h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around px-6">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 text-blue-500">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                      </svg>
                    </div>
                    <div className="text-xs mt-1 text-blue-500 font-medium">Home</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 text-gray-400 dark:text-gray-500">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                      </svg>
                    </div>
                    <div className="text-xs mt-1 text-gray-400 dark:text-gray-500">Tasks</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 text-gray-400 dark:text-gray-500">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
                      </svg>
                    </div>
                    <div className="text-xs mt-1 text-gray-400 dark:text-gray-500">Projects</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 text-gray-400 dark:text-gray-500">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div className="text-xs mt-1 text-gray-400 dark:text-gray-500">Profile</div>
                  </div>
                </div>
              </div>
              
              {/* iPhone-style notch at the top (optional) */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-2xl z-20 hidden">
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-full"></div>
              </div>
              
              {/* Reflection overlay for that glossy iOS feel */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Beautifully simple project management</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              TaskUp combines powerful features with an intuitive design, making it easy for teams to collaborate effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Intuitive Task Management",
                description: "Create, assign, and track tasks with ease. Stay on top of deadlines and priorities."
              },
              {
                title: "Team Collaboration",
                description: "Communicate effortlessly with built-in chat and comments. Keep everyone aligned."
              },
              {
                title: "Project Insights",
                description: "Visualize progress and identify bottlenecks with beautiful, insightful reports."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
                  <div className="w-6 h-6 bg-blue-500 rounded-md"></div>
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TaskUp Section */}
      <section className="py-20 px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Why choose TaskUp?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              TaskUp is completely free, with all premium features included. No hidden fees, no complicated tiers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Everything included",
                description: "Unlimited projects, teams, and tasks - all for free. No premium tier, no feature restrictions.",
                icon: (
                  <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                )
              },
              {
                name: "Beautiful design",
                description: "Inspired by Apple's design principles, TaskUp is beautiful, intuitive, and a joy to use every day.",
                icon: (
                  <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                )
              },
              {
                name: "Privacy-focused",
                description: "Your data stays private. We don't sell your information or track unnecessary usage patterns.",
                icon: (
                  <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                  </svg>
                )
              }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 transition-all duration-300 hover:shadow-lg"
                style={{ 
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  transform: index === 1 ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center">{item.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-4xl font-bold mb-6"
          >
            Ready to transform how your team works?
          </h2>
          <p
            className="text-xl mb-8 text-blue-100"
          >
            Join thousands of teams who use TaskUp to accomplish more together.
          </p>
          <a href="/register" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-full font-medium text-lg shadow-md hover:shadow-lg transition">
            Start for free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-8 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-3" />
              <span className="text-xl font-semibold">TaskUp</span>
            </div>
            <div className="flex flex-wrap justify-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4">Terms</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4">Security</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4">Status</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} TaskUp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
