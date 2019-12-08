import SearchForm from '@components/SearchForm';
import Circle from '@models/Circle';
import CircleBookmark from '@models/CircleBookmark';
import SearchPresenter from '@presenters/SearchPresenter';
import { pushCircle } from '@utils/Routing';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';

export default ({ presenter }: { presenter: SearchPresenter }) => {
  const history = useHistory();
  const [circles, setCircles] = useState([] as CircleBookmark[]);
  const [shown, setShown] = useState(presenter.shown.value);
  const [focused, setFocused] = useState(presenter.focused.value);
  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState('');

  const circlesRef = useRef(circles);
  const findAndModifyCircles = (target: Circle, cb: (circle: CircleBookmark) => void) => {
    const currentCircles = circlesRef.current;
    currentCircles.filter(circle => circle.id === target.id).forEach(cb);
    setCircles(new Array(...currentCircles));
  };

  useEffect(() => {
    const subscribers = [
      presenter.shown.subscribe(setShown),
      presenter.focused.subscribe(setFocused),
      presenter.onBookmark(value =>
        findAndModifyCircles(value, circle => (circle.bookmarked = true)),
      ),
      presenter.onUnbookmark(value =>
        findAndModifyCircles(value, circle => (circle.bookmarked = false)),
      ),
    ];
    return () => subscribers.forEach(s => s.unsubscribe());
  }, [presenter]);

  useEffect(() => {
    circlesRef.current = circles;
  }, [circles]);

  const onClear = useCallback(() => {
    setSearchText('');
    setCircles([]);
  }, []);

  const onTextChanged = useCallback(
    async (value: string) => {
      setSearchText(value);
      setSearching(true);
      const results = await presenter.search(value);
      setCircles(results);
      setSearching(false);
    },
    [presenter],
  );

  const onResultSelected = useCallback(circle => pushCircle(history, circle), [history]);
  const onResultBookmarked = useCallback(circle => presenter.bookmark(circle), [
    presenter,
  ]);
  const onResultUnbookmarked = useCallback(circle => presenter.unbookmark(circle), [
    presenter,
  ]);

  return (
    <SearchForm
      circles={circles}
      shown={shown}
      focused={focused}
      searching={searching}
      searchText={searchText}
      onFocus={useCallback(() => presenter.focused.next(true), [presenter])}
      onAction={useCallback(() => presenter.action.next(), [presenter])}
      onBack={useCallback(() => presenter.focused.next(false), [presenter])}
      onClear={onClear}
      onTextChanged={onTextChanged}
      onResultSelected={onResultSelected}
      onResultBookmarked={onResultBookmarked}
      onResultUnbookmarked={onResultUnbookmarked}
    />
  );
};
