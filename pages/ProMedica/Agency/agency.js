import { hospiceLinks, homeHealthLinks, palliativeCareLinks } from './agencyLinks.js';

import Hospice from './hospice.js';
import HomeHealth from './home-health.js';
import PalliativeCare from './palliative-care.js';

export default async function Agency() {
  // Hospice(hospiceLinks);
  // HomeHealth(homeHealthLinks);
  PalliativeCare(palliativeCareLinks);
}
