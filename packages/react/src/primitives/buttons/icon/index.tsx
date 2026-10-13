'use client';

import * as React from 'react';

import { getStrictContext } from '../../../utils/strict-context';
import { Button, type ButtonProps } from '../button';
import {
  Particles,
  ParticlesEffect,
  type ParticlesEffectProps,
} from '../../effects/particles';

type IconButtonContextType = {
  bursts: number;
};

const [IconButtonProvider, useIconButton] =
  getStrictContext<IconButtonContextType>('IconButtonContext');

type IconButtonProps = ButtonProps;

function IconButton({ onClick, style, ...props }: IconButtonProps) {
  const [bursts, setBursts] = React.useState(0);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      setBursts((count) => count + 1);
    },
    [onClick],
  );

  return (
    <IconButtonProvider value={{ bursts }}>
      <Button
        data-slot="icon-button"
        onClick={handleClick}
        style={{ position: 'relative', ...style }}
        {...props}
      />
    </IconButtonProvider>
  );
}

type IconButtonParticlesProps = ParticlesEffectProps & {
  size?: number;
};

const LAYER_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
};

function IconButtonParticles({
  size = 4,
  style,
  ...props
}: IconButtonParticlesProps) {
  const { bursts } = useIconButton();

  return (
    <Particles
      asChild
      animate={bursts > 0}
      data-slot="icon-button-particles"
      style={LAYER_STYLE}
    >
      <span aria-hidden="true">
        <ParticlesEffect
          key={bursts}
          style={{
            backgroundColor: 'currentcolor',
            borderRadius: '50%',
            width: size,
            height: size,
            ...style,
          }}
          {...props}
        />
      </span>
    </Particles>
  );
}

export {
  IconButton,
  IconButtonParticles,
  useIconButton,
  type IconButtonProps,
  type IconButtonParticlesProps,
  type IconButtonContextType,
};
