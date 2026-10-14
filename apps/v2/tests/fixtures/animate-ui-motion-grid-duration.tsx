'use client';

import {
  MotionGrid,
  MotionGridCells,
} from '@animate-ui/react/primitives/motion-grid';

export default function AnimateUIMotionGridDurationFixture() {
  return (
    <MotionGrid
      gridSize={[2, 1]}
      frames={[[[0, 0]]]}
      duration={200}
      animate={false}
      style={{ width: 80, height: 40 }}
    >
      <MotionGridCells
        className="bg-black"
        activeProps={{ animate: { opacity: 1 } }}
        inactiveProps={{ animate: { opacity: 0.2 } }}
      />
    </MotionGrid>
  );
}
