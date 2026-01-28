import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NewConceptPage from '@/app/ltrfl/concepts/new/page'
import { useRouter, useSearchParams } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

describe('LTRFL Concept Generator', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: () => null
    })
    global.fetch = jest.fn((input: RequestInfo, init?: RequestInit) => {
      if (typeof input === 'string' && input === '/api/ltrfl/generate') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            images: [
              { url: 'https://example.com/1.png', index: 0, generated_at: new Date().toISOString(), model: 'wavespeed' },
              { url: 'https://example.com/2.png', index: 1, generated_at: new Date().toISOString(), model: 'wavespeed' }
            ]
          })
        } as Response)
      }
      if (typeof input === 'string' && input.startsWith('/api/ltrfl/templates')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [], total: 0 })
        } as Response)
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as Response)
    }) as jest.Mock
  })

  it('generates image variations from a custom prompt', async () => {
    render(<NewConceptPage />)

    fireEvent.click(screen.getByText('Custom Prompt'))
    fireEvent.change(screen.getByPlaceholderText(/Describe your urn design concept/i), {
      target: { value: 'A warm memorial urn' }
    })

    fireEvent.click(screen.getByText('Generate 4 Variations'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ltrfl/generate',
        expect.objectContaining({ method: 'POST' })
      )
    })

    expect(await screen.findByAltText('Variation 1')).toBeInTheDocument()
  })
})
