import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TemplateLibraryPage from '@/app/ltrfl/templates/page'
import { useRouter, useSearchParams } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

describe('LTRFL Template Library', () => {
  const mockReplace = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ replace: mockReplace })
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: () => null,
      toString: () => ''
    })
    global.fetch = jest.fn((input: RequestInfo, init?: RequestInit) => {
      if (typeof input === 'string' && input.startsWith('/api/ltrfl/templates')) {
        if (init?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              id: 'template-1',
              name: 'Test Template',
              category: 'Sports & Recreation',
              subcategory: 'Baseball',
              prompt: 'Test prompt',
              variables: {},
              brand_colors: { primary: '#9CAF88', secondary: '#F5F1EB' },
              is_active: true
            })
          } as Response)
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [], total: 0 })
        } as Response)
      }

      return Promise.resolve({ ok: true, json: async () => ({}) } as Response)
    }) as jest.Mock
  })

  it('creates a template from the editor', async () => {
    render(<TemplateLibraryPage />)

    fireEvent.click(screen.getByText('Create Template'))

    fireEvent.change(screen.getByPlaceholderText('Template name'), { target: { value: 'Test Template' } })
    fireEvent.change(screen.getByPlaceholderText('Enter the urn concept prompt...'), { target: { value: 'Test prompt' } })

    fireEvent.click(screen.getByText('Save Template'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ltrfl/templates',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })
})
