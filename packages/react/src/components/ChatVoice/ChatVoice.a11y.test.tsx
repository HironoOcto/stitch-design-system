import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ChatVoice } from './ChatVoice';

const WAVE = [0.3, 0.6, 0.9, 0.5, 0.7, 1, 0.4, 0.8];

describe('ChatVoice a11y', () => {
  it('语音消息（播放按钮有可访问名、波形装饰性）无 axe 违规', async () => {
    const { container } = render(
      <ChatVoice
        waveform={WAVE}
        duration="0:12"
        percent={40}
        playing={false}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
