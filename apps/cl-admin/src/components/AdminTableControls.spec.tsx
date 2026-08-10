import { fireEvent, render, screen } from '@testing-library/react';
import { AdminPagination } from './AdminTableControls';

describe('AdminPagination', () => {
  it('renders page numbers and calls navigation controls', () => {
    const onPageChange = jest.fn();
    const onPageSizeChange = jest.fn();
    render(<AdminPagination totalCount={95} page={5} pageSize={10} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />);

    expect(screen.getByText('41–50')).toBeTruthy();
    expect(screen.getByRole('button', { name: '5' }).getAttribute('aria-current')).toBe('page');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(6);
    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '25' } });
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
  });
});
