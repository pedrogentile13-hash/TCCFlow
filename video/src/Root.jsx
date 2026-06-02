import { Composition } from 'remotion';
import { Announcement } from './Announcement';

export function Root() {
  return (
    <Composition
      id="Announcement"
      component={Announcement}
      durationInFrames={600}
      fps={30}
      width={1080}
      height={1920}
    />
  );
}
