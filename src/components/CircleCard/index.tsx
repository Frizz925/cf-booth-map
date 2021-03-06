import Circle from '@models/Circle';
import classNames from 'classnames';
import React, {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Body from './Body';
import Header from './Header';
import * as styles from './styles.scss';

const PULL_DELTA_THRESHOLD = 80;
const PULL_VELOCITY_THRESHOLD = 0.5;
const VISIBLE_HEIGHT_THRESHOLD = 0;

export interface CircleCardProps {
  containerRef?: RefObject<HTMLDivElement>;
  circle?: Circle;
  bookmarked: boolean;
  shown: boolean;
  pulled: boolean;

  onBookmarked: () => void;
  onUnbookmarked: () => void;

  onOverlayClick: () => void;
  onCardPulled: () => void;
  onCardHidden: () => void;
  onCardTabbed: () => void;

  navbar?: Element;
}

const CircleCard: React.FC<CircleCardProps> = props => {
  const [pulling, setPulling] = useState(false);

  const propsRef = useRef(props);
  const overlayRef = useRef<HTMLDivElement>();
  const containerRef = props.containerRef || useRef<HTMLDivElement>();
  const headerRef = useRef<HTMLDivElement>();
  const previewRef = useRef<HTMLDivElement>();
  const actionsRef = useRef<HTMLDivElement>();
  const bodyRef = useRef<HTMLDivElement>();
  const bottomPadRef = useRef<HTMLDivElement>();
  const panStateRef = useRef({
    deltaY: 0,
    startBottom: 0,
    currentBottom: 0,
    wasPulled: false,
  });

  const getHeight = useCallback((ref: RefObject<Element>) => {
    const el = ref.current;
    return el ? el.clientHeight : 0;
  }, []);

  const getNavbarHeight = useCallback(() => {
    const navbar = propsRef.current.navbar;
    return navbar ? navbar.clientHeight : 0;
  }, []);

  const updateCard = () => {
    const { shown, pulled } = propsRef.current;
    const panState = panStateRef.current;
    const container = containerRef.current;
    const bottomPad = bottomPadRef.current;
    panState.wasPulled = pulled;
    if (!container || pulling) {
      return;
    }

    const navbarHeight = getNavbarHeight();
    if (bottomPad && navbarHeight > 0) {
      bottomPad.style.paddingBottom = `${navbarHeight}px`;
    }

    let bottom = 0;
    if (!shown) {
      bottom = -container.clientHeight;
    } else if (shown && !pulled) {
      bottom = -(container.clientHeight - navbarHeight - getHeight(previewRef));
    }
    updateContainerPosition(bottom);
  };

  const onPanMove = (evt: HammerInput) => {
    const { pulled, onCardPulled, onCardHidden, onCardTabbed } = propsRef.current;
    const panState = panStateRef.current;
    if (evt.type === 'panstart') {
      panState.startBottom = panState.currentBottom;
      setPulling(true);
    } else if (evt.type === 'panend') {
      const deltaThreshold = Math.abs(evt.deltaY) >= window.innerHeight / 2;
      const velocityThreshold = Math.abs(evt.velocityY) >= PULL_VELOCITY_THRESHOLD;
      const reachThreshold = deltaThreshold || velocityThreshold;
      if (velocityThreshold && Math.sign(evt.velocityY) <= 0) {
        panState.wasPulled = true;
        onCardPulled();
      } else if (velocityThreshold && Math.sign(evt.velocityY) > 0) {
        if (pulled) {
          panState.wasPulled = false;
          onCardTabbed();
        } else {
          onCardHidden();
        }
      } else if (deltaThreshold && Math.sign(evt.deltaY) <= 0) {
        panState.wasPulled = true;
        onCardPulled();
      } else {
        const currentBottom = panState.currentBottom;
        const hiddenThreshold =
          getHeight(containerRef) -
          getNavbarHeight() -
          getHeight(previewRef) / 2 +
          VISIBLE_HEIGHT_THRESHOLD;
        if (-currentBottom >= hiddenThreshold) {
          panState.wasPulled = false;
          onCardHidden();
        } else if (pulled && reachThreshold) {
          panState.wasPulled = false;
          onCardTabbed();
        }
      }
      setPulling(false);
      return;
    }
    panState.deltaY = evt.deltaY;
    const bottom = panState.startBottom - evt.deltaY;
    updateContainerPosition(bottom);
  };

  const updateContainerPosition = (bottom: number) => {
    if (bottom > 0) {
      return;
    }
    const panState = panStateRef.current;
    const overlay = overlayRef.current;
    const container = containerRef.current;
    const currentOpacity =
      1.0 + bottom / (container.clientHeight - getHeight(previewRef) - getNavbarHeight());
    const opacity = Math.min(Math.max(0, currentOpacity), 1.0);
    overlay.style.setProperty('opacity', `${opacity}`);
    panState.currentBottom = bottom;
    container.style.setProperty('bottom', `${bottom}px`);
  };

  useEffect(() => {
    window.addEventListener('resize', updateCard);
    const mc = new Hammer.Manager(headerRef.current);
    mc.add(new Hammer.Pan({ threshold: 0, pointers: 1 }));
    mc.on('panstart panup pandown panend', onPanMove);

    return () => {
      mc.destroy();
      window.removeEventListener('resize', updateCard);
    };
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) {
      body.scrollTop = 0;
    }
  }, [props.circle]);

  useLayoutEffect(() => {
    propsRef.current = props;
    updateCard();
  });

  const render = () => {
    const {
      circle,
      bookmarked,
      shown,
      pulled,
      onBookmarked,
      onUnbookmarked,
      onOverlayClick,
    } = props;
    const classModifiers = {
      [styles.shown]: shown,
      [styles.pulled]: pulled,
      [styles.pulling]: pulling,
    };
    const overlayClassNames = classNames(
      'overlay-generic',
      { 'overlay-visible': shown },
      styles.overlay,
      classModifiers,
    );
    const containerClassNames = classNames(styles.container, classModifiers);
    return (
      <div>
        <div ref={overlayRef} className={overlayClassNames} onClick={onOverlayClick} />
        <div ref={containerRef} className={containerClassNames}>
          <Header
            headerRef={headerRef}
            previewRef={previewRef}
            actionsRef={actionsRef}
            circle={circle}
            bookmarked={bookmarked}
            onBookmarked={onBookmarked}
            onUnbookmarked={onUnbookmarked}
          />
          {circle ? (
            <Body circle={circle} bodyRef={bodyRef} bottomRef={bottomPadRef} />
          ) : null}
        </div>
      </div>
    );
  };

  return render();
};

export default CircleCard;
