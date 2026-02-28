import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

// Mock Supabase client
vi.mock('../../../lib/supabase', () => {
  const signInWithPassword = vi.fn(() => Promise.resolve({ data: { user: { id: 'u1' } }, error: null }))
  return {
    supabase: {
      auth: {
        signInWithPassword,
        signUp: vi.fn(() => Promise.resolve({ data: null, error: null })),
        getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      },
      from: vi.fn(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: { id: 'u1', email: 'user@example.com' }, error: null })
          })
        })
      })),
    }
  }
})

// Mock userService to avoid network calls
vi.mock('../../../services/userService', () => ({
  userService: {
    createUser: vi.fn(() => Promise.resolve({}))
  }
}))

import { ProfessionalAuth } from '../ProfessionalAuth'

describe('ProfessionalAuth', () => {
  it('normalizes email before calling supabase.auth.signInWithPassword', async () => {
    const { supabase } = await import('../../../lib/supabase')
    const onAuth = vi.fn()

    render(<ProfessionalAuth onAuth={onAuth} />)

    const emailInput = screen.getByPlaceholderText('you@company.com') as HTMLInputElement
    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement

    // Enter email with spaces and mixed case
    fireEvent.change(emailInput, { target: { value: ' USER@Example.COM ' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Submit the form
    const form = emailInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123'
      })
    })
  })

  it('retries on transient errors and eventually succeeds', async () => {
    const { supabase } = await import('../../../lib/supabase')
    const onAuth = vi.fn()

    // Make first call fail with transient error, then succeed
    (supabase.auth.signInWithPassword as unknown as vi.Mock)
      .mockImplementationOnce(() => Promise.resolve({ data: null, error: { status: 502, message: 'Bad Gateway' } }))
      .mockImplementationOnce(() => Promise.resolve({ data: { user: { id: 'u1' } }, error: null }))

    render(<ProfessionalAuth onAuth={onAuth} />)

    const emailInput = screen.getByPlaceholderText('you@company.com') as HTMLInputElement
    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement

    fireEvent.change(emailInput, { target: { value: 'retry@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const form = emailInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(2)
      expect(onAuth).toHaveBeenCalled()
    })
  })
})
