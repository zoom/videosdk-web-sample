import { forwardRef, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { ShareViewProps } from './share-view-types';
import ZoomMediaContext from '../../../../context/media-context';
import MultiShareView from './multi-share-view';
import SingleShareView from './single-share-view';
const ShareView = forwardRef((props: ShareViewProps, ref: any) => {
  const { mediaStream } = useContext(ZoomMediaContext);
  const [searchParams] = useSearchParams();
  const isMultiShareView = useMemo(() => {
    if (mediaStream) {
      return searchParams.get('multiShareView') === '1' && mediaStream.getMaxRenderableShareViews() > 1;
    } else {
      return false;
    }
  }, [mediaStream, searchParams]);
  return isMultiShareView ? <MultiShareView ref={ref} {...props} /> : <SingleShareView ref={ref} {...props} />;
});
export default ShareView;
