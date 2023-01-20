import { hospiceLinks, homeHealthLinks } from './agencyLinks.js';

import Hospice from './hospice.js';
import HomeHealth from './home-health.js';

export default async function Agency() {
  // Hospice(hospiceLinks);
  HomeHealth(homeHealthLinks);
}
