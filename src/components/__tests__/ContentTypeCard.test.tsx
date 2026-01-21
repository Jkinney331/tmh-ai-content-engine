import { render, screen, fireEvent } from '@testing-library/react'
import ContentTypeCard from '../ContentTypeCard'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

describe('ContentTypeCard', () => {
  const mockPush = jest.fn()
  const mockContentType = {
    id: 'test-id-123',
    name: 'Twitter Post',
    description: 'Create engaging Twitter posts',
    template: 'Sample template',
    variables: { topic: 'string', tone: 'string' },
    output_format: 'text',
    platform_specs: { maxLength: 280, hashtags: true },
    active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
  })

  it('displays content type name', () => {
    render(<ContentTypeCard contentType={mockContentType} />)
    expect(screen.getByText('Twitter Post')).toBeInTheDocument()
  })

  it('displays content type description', () => {
    render(<ContentTypeCard contentType={mockContentType} />)
    expect(screen.getByText('Create engaging Twitter posts')).toBeInTheDocument()
  })

  it('displays output format with icon', () => {
    render(<ContentTypeCard contentType={mockContentType} />)
    expect(screen.getByText('text')).toBeInTheDocument()
  })

  it('navigates to content creation flow when clicked', () => {
    render(<ContentTypeCard contentType={mockContentType} />)

    const card = screen.getByText('Twitter Post').closest('div[class*="cursor-pointer"]')
    fireEvent.click(card!)

    expect(mockPush).toHaveBeenCalledWith(
      '/generate?type=social&contentTypeId=test-id-123&contentTypeName=Twitter%20Post'
    )
  })

  it('passes content_type_id to creation flow', () => {
    render(<ContentTypeCard contentType={mockContentType} />)

    const card = screen.getByText('Twitter Post').closest('div[class*="cursor-pointer"]')
    fireEvent.click(card!)

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('contentTypeId=test-id-123')
    )
  })

  it('calls custom onClick handler when provided', () => {
    const customOnClick = jest.fn()
    render(<ContentTypeCard contentType={mockContentType} onClick={customOnClick} />)

    const card = screen.getByText('Twitter Post').closest('div[class*="cursor-pointer"]')
    fireEvent.click(card!)

    expect(customOnClick).toHaveBeenCalledWith(mockContentType)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows active status for active content types', () => {
    render(<ContentTypeCard contentType={mockContentType} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows inactive status for inactive content types', () => {
    const inactiveType = { ...mockContentType, active: false }
    render(<ContentTypeCard contentType={inactiveType} />)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })
})