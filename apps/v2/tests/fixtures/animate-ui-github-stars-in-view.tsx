'use client';

import * as React from 'react';
import {
  GitHubStarsButton,
  GitHubStarsButtonNumber,
} from '@animate-ui/react/primitives/buttons/github-stars';

export default function GitHubStarsInViewFixture() {
  const [repo, setRepo] = React.useState('animate-ui');

  return (
    <div className="flex flex-col items-start gap-6">
      <button type="button" onClick={() => setRepo('other')}>
        Switch repo
      </button>
      <GitHubStarsButton username="imskyleen" repo={repo} inView asChild>
        <a href="https://github.com/imskyleen/animate-ui">
          <GitHubStarsButtonNumber className="tabular-nums" />
        </a>
      </GitHubStarsButton>
    </div>
  );
}
