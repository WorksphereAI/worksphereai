import React, { useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { AuthComponent } from './components/Auth'
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

  if (!user) {
    return <AuthComponent onAuth={setUser} />
  }

  return <Dashboard user={user} />
}

export default App
