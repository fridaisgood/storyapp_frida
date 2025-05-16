import { HomePresenter } from '../presenters/home-presenter';

export function showHome(container) {
  const presenter = new HomePresenter(container);
  presenter.init();
}

