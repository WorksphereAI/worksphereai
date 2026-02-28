// marketing/pages/index.tsx
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  Star,
  Globe,
  Smartphone,
  Lock,
  TrendingUp,
  MessageSquare,
  Calendar,
  FileText,
  Award,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  return (
    <>
      <Head>
        <title>WorkSphere AI - Enterprise Operating System for African Businesses</title>
        <meta name="description" content="The first AI-native corporate operating system built for African businesses. Replace WhatsApp with structured, secure, intelligent communication." />
        <meta name="keywords" content="enterprise software, business communication, AI platform, Rwanda, Africa, digital transformation" />
        <meta property="og:title" content="WorkSphere AI - Enterprise Operating System for African Businesses" />
        <meta property="og:description" content="The first AI-native corporate operating system built for African businesses." />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="WorkSphere AI" />
        <meta name="twitter:description" content="Enterprise Operating System for African Businesses" />
        <meta name="twitter:image" content="/og-image.jpg" />
      </Head>

      <div className="min-h-screen bg-white">
        
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-blue-600">WorkSphere AI</h1>
                </div>
                <div className="hidden md:block ml-10">
                  <div className="flex items-baseline space-x-4">
                    <Link href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Features
                    </Link>
                    <Link href="#pricing" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Pricing
                    </Link>
                    <Link href="#enterprise" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Enterprise
                    </Link>
                    <Link href="#about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      About
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-6">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    The First AI-Native
                    <span className="text-blue-600"> Enterprise OS</span>
                    <br />
                    for African Businesses
                  </h1>
                  <p className="mt-6 text-xl text-gray-600 lg:text-2xl">
                    Replace fragmented communication with a unified, intelligent platform. Built specifically for the African market.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                    <Link href="#demo" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center">
                      Book Demo
                      <Calendar className="ml-2 w-5 h-5" />
                    </Link>
                  </div>
                  <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-gray-600">14-day free trial</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-gray-600">No credit card required</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 mt-12 lg:mt-0">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">System Status: Operational</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <Users className="w-8 h-8 text-blue-600 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">1,234</div>
                        <div className="text-sm text-gray-600">Active Users</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">98%</div>
                        <div className="text-sm text-gray-600">Satisfaction</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <Shield className="w-8 h-8 text-purple-600 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">99.9%</div>
                        <div className="text-sm text-gray-600">Uptime</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <Zap className="w-8 h-8 text-orange-600 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">&lt;200ms</div>
                        <div className="text-sm text-gray-600">Response Time</div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Recent Activity</span>
                        <span className="text-xs text-gray-500">Live</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-gray-600">• Rwanda Development Board - Onboarding</div>
                        <div className="text-xs text-gray-600">• Bank of Kigali - Integration Complete</div>
                        <div className="text-xs text-gray-600">• MTN Rwanda - Partnership Signed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 uppercase tracking-wide">TRUSTED BY LEADING AFRICAN ORGANIZATIONS</p>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="flex items-center justify-center">
                  <div className="text-lg font-semibold text-gray-700">Rwanda Development Board</div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-lg font-semibold text-gray-700">Bank of Kigali</div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-lg font-semibold text-gray-700">MTN Rwanda</div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-lg font-semibold text-gray-700">Airtel Rwanda</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Everything Your Business Needs in One Platform
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                From messaging to analytics, we've got you covered
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Messaging</h3>
                <p className="text-gray-600">
                  Replace WhatsApp with secure, organized business communication. AI-powered insights and automation.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Management</h3>
                <p className="text-gray-600">
                  Secure file storage with version control, access permissions, and intelligent document organization.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                <p className="text-gray-600">
                  Real-time insights into productivity, engagement, and business performance with AI-powered recommendations.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile Offline Mode</h3>
                <p className="text-gray-600">
                  Work seamlessly even without internet. Automatic sync when connectivity is restored.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                <p className="text-gray-600">
                  Bank-level encryption, compliance with data protection regulations, and comprehensive audit trails.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Integration Hub</h3>
                <p className="text-gray-600">
                  Connect with your favorite tools. Slack, Google Drive, Salesforce, and 100+ other integrations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Start free and scale as you grow
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
                <p className="mt-2 text-gray-600">Perfect for small teams</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">99,000 RWF</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Up to 10 users</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">50 GB storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Basic analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Email support</span>
                  </li>
                </ul>
                <Link href="/signup" className="mt-8 block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 text-center">
                  Get Started
                </Link>
              </div>

              <div className="bg-blue-600 p-8 rounded-xl shadow-lg border-2 border-blue-600 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">Professional</h3>
                <p className="mt-2 text-blue-100">For growing businesses</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-white">299,000 RWF</span>
                  <span className="text-blue-100">/month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-white mr-3" />
                    <span className="text-white">Up to 50 users</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-white mr-3" />
                    <span className="text-white">200 GB storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-white mr-3" />
                    <span className="text-white">Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-white mr-3" />
                    <span className="text-white">Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-white mr-3" />
                    <span className="text-white">API access</span>
                  </li>
                </ul>
                <Link href="/signup" className="mt-8 block w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 text-center">
                  Start Free Trial
                </Link>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
                <p className="mt-2 text-gray-600">For large organizations</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">999,000 RWF</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited users</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">1 TB storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">White-label solution</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Custom integrations</span>
                  </li>
                </ul>
                <Link href="#demo" className="mt-8 block w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 text-center">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Loved by Teams Across Africa
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                See what our customers have to say
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "WorkSphere AI has transformed how we communicate. It's like having a smart assistant that understands our business needs."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <div className="font-semibold text-gray-900">John M. Rugema</div>
                    <div className="text-sm text-gray-600">CEO, Rwanda Tech Hub</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The offline mode is a game-changer for our field teams. We can work anywhere and sync when we're back online."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah K. Niyonzima</div>
                    <div className="text-sm text-gray-600">Operations Director, EcoBank Rwanda</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Finally, a platform built for African businesses. The mobile money integration and local support make all the difference."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <div className="font-semibold text-gray-900">David L. Mukasa</div>
                    <div className="text-sm text-gray-600">CTO, MTN Rwanda</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="demo" className="py-20 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to Transform Your Business?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Join thousands of African businesses already using WorkSphere AI
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 flex items-center justify-center">
                Start Free Trial
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="#contact" className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 flex items-center justify-center">
                Book Demo
                <Calendar className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-blue-400 mb-4">WorkSphere AI</h3>
                <p className="text-gray-400">
                  The first AI-native enterprise operating system built for African businesses.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#features" className="hover:text-white">Features</Link></li>
                  <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                  <li><Link href="#enterprise" className="hover:text-white">Enterprise</Link></li>
                  <li><Link href="#integrations" className="hover:text-white">Integrations</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#about" className="hover:text-white">About</Link></li>
                  <li><Link href="#careers" className="hover:text-white">Careers</Link></li>
                  <li><Link href="#blog" className="hover:text-white">Blog</Link></li>
                  <li><Link href="#contact" className="hover:text-white">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Connect</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Kigali, Rwanda</li>
                  <li>Nairobi, Kenya</li>
                  <li>Lagos, Nigeria</li>
                  <li>Johannesburg, South Africa</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
              <p>&copy; 2024 WorkSphere AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
