import React, { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { Building2 } from 'lucide-react'

interface AuthProps {
  onAuth: (user: any) => void
}

export const AuthComponent: React.FC<AuthProps> = ({ onAuth }) => {
  const [isSignUp, setIsSignUp] = useState(false)

  React.useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const userData = await getUserProfile(session.user.id)
        if (userData) {
          onAuth(userData)
        }
      }
    }
    
    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = await getUserProfile(session.user.id)
        if (userData) {
          onAuth(userData)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [onAuth])

  const getUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error:', error)
      return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-modal rounded-xl p-8">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="w-8 h-8 text-brand-600" />
            <h1 className="text-2xl font-semibold text-gray-900">WorkSphere</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Intelligent Corporate Operating System
          </p>
        </div>

        {/* Auth Container */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
        </div>

        <div className="supabase-auth-ui">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563EB',
                    brandAccent: '#1D4ED8',
                  }
                }
              },
              className: {
                container: 'space-y-4',
                button: 'btn btn-primary w-full',
                input: 'input',
                label: 'form-label',
                anchor: 'text-brand-600 hover:text-brand-700 text-sm',
                message: 'text-error-600 text-sm mt-1',
              }
            }}
            providers={['google']}
            redirectTo={import.meta.env.VITE_PROD_URL || window.location.origin}
            view={isSignUp ? 'sign_up' : 'sign_in'}
          />
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors duration-200"
          >
            {isSignUp 
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </div>
    </div>
  )
}
