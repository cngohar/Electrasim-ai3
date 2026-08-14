import { describe, expect, it } from 'vitest';
import {
  type BlogPostLike,
  getTagArchives,
  pageRange,
  paginatePosts,
  partitionBlogPosts,
  readingTime,
  selectPostsById,
  slugifyTag,
  totalPages,
} from './blog';

function post(id: string, tags: string[]): BlogPostLike {
  return {
    id,
    body: 'test',
    data: {
      title: id,
      description: id,
      pubDate: new Date('2026-01-01'),
      tags,
      category: 'Guide',
    },
  };
}

describe('blog helpers', () => {
  it('creates stable URL-safe tag slugs', () => {
    expect(slugifyTag("Ohm's Law & Safety")).toBe('ohm-s-law-and-safety');
  });

  it('only returns tag archives meeting the threshold', () => {
    const archives = getTagArchives(
      [
        post('one', ['RCD', 'Safety']),
        post('two', ['RCD']),
        post('three', ['RCD']),
        post('four', ['Safety']),
      ],
      3,
    );

    expect(archives.map(({ slug, posts }) => [slug, posts.length])).toEqual([['rcd', 3]]);
  });

  it('does not count duplicate tag spellings twice within one post', () => {
    const archives = getTagArchives([post('one', ['RCD', 'rcd']), post('two', ['RCD'])], 2);
    expect(archives[0]?.posts).toHaveLength(2);
  });

  it('paginates one shared static corpus', () => {
    const items = Array.from({ length: 20 }, (_, index) => index + 1);
    expect(totalPages(items.length)).toBe(3);
    expect(paginatePosts(items, 2)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18]);
    expect(pageRange(4, 10)).toEqual([1, '...', 3, 4, 5, '...', 10]);
  });

  it('separates app updates without changing item order or membership', () => {
    const guideOne = post('guide-one', []);
    const update = post('update', []);
    update.data.category = 'App Update';
    const guideTwo = post('guide-two', []);

    const partitioned = partitionBlogPosts([guideOne, update, guideTwo]);

    expect(partitioned.appUpdates.map(({ id }) => id)).toEqual(['update']);
    expect(partitioned.articles.map(({ id }) => id)).toEqual(['guide-one', 'guide-two']);
    expect([...partitioned.appUpdates, ...partitioned.articles]).toHaveLength(3);
  });

  it('keeps curated post order and ignores missing entries', () => {
    const posts = [post('one', []), post('two', [])];
    expect(selectPostsById(posts, ['two', 'missing', 'one']).map(({ id }) => id)).toEqual([
      'two',
      'one',
    ]);
  });

  it('always reports at least one minute', () => {
    expect(readingTime('')).toBe(1);
    expect(readingTime(Array.from({ length: 400 }, () => 'word').join(' '))).toBe(2);
  });
});
