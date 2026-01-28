import { Suspense, act } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConceptDetailPage from '@/app/ltrfl/concepts/[id]/page'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

describe('LTRFL Concept Approval', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    global.fetch = jest.fn((input: RequestInfo, init?: RequestInit) => {
      if (typeof input === 'string' && input.startsWith('/api/ltrfl/concepts?root_id=')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([])
        } as Response)
      }
      if (typeof input === 'string' && input.startsWith('/api/ltrfl/concepts/')) {
        if (init?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              id: 'concept-1',
              category: 'Sports & Recreation',
              subcategory: 'Baseball',
              prompt_used: 'Test prompt',
              images: [{ url: 'https://example.com/1.png', index: 0 }],
              selected_image_index: 0,
              status: 'approved',
              notes: null,
              version: 1,
              parent_version_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          } as Response)
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 'concept-1',
            category: 'Sports & Recreation',
            subcategory: 'Baseball',
            prompt_used: 'Test prompt',
            images: [{ url: 'https://example.com/1.png', index: 0 }],
            selected_image_index: 0,
            status: 'reviewing',
            notes: null,
            version: 1,
            parent_version_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        } as Response)
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as Response)
    }) as jest.Mock
  })

  it('approves a concept and routes to CAD specs', async () => {
    await act(async () => {
      render(
        <Suspense fallback={<div>Loading</div>}>
          <ConceptDetailPage params={Promise.resolve({ id: 'concept-1' })} />
        </Suspense>
      )
    })

    const approveButton = await screen.findByText('Approve Concept')
    fireEvent.click(approveButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ltrfl/concepts/concept-1',
        expect.objectContaining({ method: 'PUT' })
      )
    })

    expect(mockPush).toHaveBeenCalledWith('/ltrfl/concepts/concept-1/cad-specs')
  })
})
