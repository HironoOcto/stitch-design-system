import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ChatImage } from './ChatImage';

const SRC =
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

describe('ChatImage a11y', () => {
  it('图片缩略图（图片有 alt、可开大图）无 axe 违规', async () => {
    const { container } = render(
      <ChatImage src={SRC} alt="设计稿预览" width={220} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
