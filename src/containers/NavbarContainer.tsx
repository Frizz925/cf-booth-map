import Navbar, { NavbarItem } from '@components/Navbar';
import { faHeart, faMap, faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import {
  faHeart as faHeartSolid,
  faInfoCircle,
  faMapMarked,
  faSync,
} from '@fortawesome/free-solid-svg-icons';
import NavbarPresenter from '@presenters/NavbarPresenter';
import { isFullscreen } from '@utils/Device';
import each from 'lodash/each';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const navbarItems: NavbarItem[] = [
  {
    icon: faMap,
    iconActive: faMapMarked,
    title: 'Map',
    path: '/',
  },
  {
    icon: faHeart,
    iconActive: faHeartSolid,
    title: 'Favorites',
    path: '/bookmarks',
  },
  {
    icon: faQuestionCircle,
    iconActive: faInfoCircle,
    title: 'About',
    path: '/about',
  },
];

if (isFullscreen) {
  navbarItems.push({
    icon: faSync,
    title: 'Refresh',
    action: () => (window.location.href = '/'),
  });
}

const findIndexByPath = (path: string) => {
  let result = 0;
  each(navbarItems, (item, index) => {
    if (item.path === path) {
      result = index;
      return false;
    }
  });
  return result;
};

export default ({ presenter }: { presenter: NavbarPresenter }) => {
  const location = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(presenter.selectedIndex.value);
  const [shown, setShown] = useState(presenter.shown.value);
  const navbarRef = useRef<HTMLDivElement>();
  useEffect(() => {
    presenter.navbarElement.next(navbarRef.current);
    const subscribers = [
      presenter.selectedIndex.subscribe(setSelectedIndex),
      presenter.shown.subscribe(setShown),
      presenter.path.subscribe(path => {
        presenter.selectedIndex.next(findIndexByPath(path));
      }),
    ];
    presenter.path.next(location.pathname);
    return () => subscribers.forEach(s => s.unsubscribe());
  }, []);
  return (
    <Navbar
      id='navbar'
      containerRef={navbarRef}
      shown={shown}
      selectedIndex={selectedIndex}
      items={navbarItems}
      onSelected={useCallback((_, idx) => presenter.selectedIndex.next(idx), [presenter])}
    />
  );
};
