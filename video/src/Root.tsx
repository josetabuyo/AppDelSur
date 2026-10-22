import {Composition} from 'remotion';
import {Explicativo, TOTAL} from './Explicativo';
export const Root = () => (
  <Composition id="Explicativo" component={Explicativo} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
