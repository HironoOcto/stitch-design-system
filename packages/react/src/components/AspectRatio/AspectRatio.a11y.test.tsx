import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { AspectRatio } from './AspectRatio';

describe('AspectRatio a11y', () => {
  // 纯布局件、无 ARIA/role，比例框内含常规媒体 → 无 axe 违规。
  it('比例框含图片时无 axe 违规', async () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <img
          src="photo.png"
          alt="岛屿风景"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AspectRatio>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
