import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ChatFile } from './ChatFile';

describe('ChatFile a11y', () => {
  it('可点击 + 可下载的文件卡无 axe 违规', async () => {
    const { container } = render(
      <ChatFile
        name="需求评审纪要.pdf"
        size={2_411_724}
        description="PDF"
        onClick={() => {}}
        onDownload={() => {}}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('只读文件卡（无回调）无 axe 违规', async () => {
    const { container } = render(<ChatFile name="README.md" size={840} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
