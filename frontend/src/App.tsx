import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from './components/Dashboard'
import { ProfessionalAuth } from './components/auth/ProfessionalAuth'
import { SignupPage } from './components/auth/SignupPage'
import { EnterpriseSignup } from './components/auth/EnterpriseSignup'
import { IndividualSignup } from './components/auth/IndividualSignup'
import { CustomerSignup } from './components/auth/CustomerSignup'
import { EmailVerification } from './components/auth/EmailVerification'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { supabase } from './lib/supabase'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    // Check for existing session
    const initializeApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Get user profile with organization data
          const { data: userProfile } = await supabase
            .from('users')
            .select(`
              *,
              organizations:organization_id (*)
            `)
            .eq('id', session.user.id)
            .single()
          
          if (userProfile) {
            setUser(userProfile)
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeApp()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { data: userProfile } = await supabase
            .from('users')
            .select(`
              *,
              organizations:organization_id (*)
            `)
            .eq('id', session.user.id)
            .single()
          
          if (userProfile) {
            setUser(userProfile)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading WorkSphere...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Default route - redirect to signup */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<ProfessionalAuth onAuth={setUser} />} />
        <Route path="/signin" element={<ProfessionalAuth onAuth={setUser} />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        
        {/* Signup routes */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/enterprise" element={<EnterpriseSignup />} />
        <Route path="/signup/individual" element={<IndividualSignup />} />
        <Route path="/signup/customer" element={<CustomerSignup />} />
        
        {/* Email verification */}
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/verify" element={<EmailVerification />} />
        
        {/* Onboarding */}
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/setup" element={<OnboardingFlow />} />
        
        {/* Password reset */}
        <Route path="/reset-password" element={<ProfessionalAuth onAuth={setUser} />} />
        <Route path="/forgot-password" element={<ProfessionalAuth onAuth={setUser} />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/app" element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} />
        
        {/* Customer portal */}
        <Route path="/customer-portal" element={user ? <Dashboard user={user} /> : <Navigate to="/signup/customer" replace />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} />
        
        {/* Legacy routes - redirect to new ones */}
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/authenticate" element={<Navigate to="/login" replace />} />
        
        {/* Catch all - redirect to signup */}
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </Router>
  )
}

export default App
