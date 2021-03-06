import Snackbar from '@components/Snackbar';
import NavbarPresenter from '@presenters/NavbarPresenter';
import SnackbarPresenter from '@presenters/SnackbarPresenter';
import { isIphoneXAppMode } from '@utils/Device';
import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';

const getTop = (ref: RefObject<Element>) => {
  const el = ref.current;
  if (!el) {
    return 0;
  }
  return el.getBoundingClientRect().top;
};

export default ({
  presenter,
  navbarPresenter,
}: {
  presenter: SnackbarPresenter;
  navbarPresenter: NavbarPresenter;
}) => {
  const [shown, setShown] = useState(presenter.shown);
  const [content, setContent] = useState(presenter.content);

  const navbarRef = useRef<Element>();
  const bottomRef = useRef(0);

  const bottom = useMemo(() => {
    if (!shown) {
      return bottomRef.current;
    }

    const navbarTop = getTop(navbarRef);

    let anchorTop = 0;
    if (navbarPresenter.shown.value && navbarTop < window.innerHeight) {
      anchorTop = navbarTop;
    }

    const result =
      anchorTop > 0 ? window.innerHeight - anchorTop : isIphoneXAppMode ? 32 : 0;
    bottomRef.current = result;
    return result;
  }, [shown]);

  useEffect(() => {
    const subscribers = [
      presenter.onShown(setShown),
      presenter.onContent(setContent),
      navbarPresenter.navbarElement.subscribe(navbar => {
        navbarRef.current = navbar;
      }),
    ];
    return () => subscribers.forEach(s => s.unsubscribe());
  }, [presenter]);

  const { message, action } = content;
  useEffect(() => {
    if (action || !shown) {
      return;
    }
    setTimeout(() => presenter.result(false), 4000);
  }, [action, shown]);

  return (
    <Snackbar
      shown={shown}
      message={message}
      action={action}
      onResult={result => presenter.result(result)}
      bottom={bottom}
    />
  );
};
