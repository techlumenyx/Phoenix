import { adminPage, pageResult } from './admin-pagination';

describe('admin pagination', () => {
  it('defaults to ten rows and the configured sort', () => {
    expect(adminPage({}, 'createdAt', ['createdAt', 'title'])).toEqual({
      limit: 10,
      offset: 0,
      sort: { createdAt: -1, _id: -1 },
    });
  });

  it('bounds pagination and rejects unsupported sort fields', () => {
    expect(adminPage({ limit: 500, offset: -20, sortBy: 'secret', sortDirection: 'ASC' }, 'title', ['title'])).toEqual({
      limit: 100,
      offset: 0,
      sort: { title: 1, _id: 1 },
    });
  });

  it('reports totals and whether another page exists', () => {
    expect(pageResult([{ id: 'a' }, { id: 'b' }], 12, 2, 8)).toEqual({
      edges: [{ id: 'a' }, { id: 'b' }],
      totalCount: 12,
      hasNextPage: true,
      endCursor: 'b',
    });
  });
});
