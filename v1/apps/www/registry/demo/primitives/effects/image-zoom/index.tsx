import { ImageZoom, Image } from '@/registry/primitives/effects/image-zoom';
import NextImage from 'next/image';

export const ImageZoomDemo = () => {
  return (
    <ImageZoom className="rounded-2xl">
      <Image
        src="https://images.pexels.com/photos/34293571/pexels-photo-34293571.jpeg"
        alt="Aerial View of the Great Lake of Almaty in Kazakhstan"
        as={NextImage}
        width={3840}
        height={2160}
      />
    </ImageZoom>
  );
};
