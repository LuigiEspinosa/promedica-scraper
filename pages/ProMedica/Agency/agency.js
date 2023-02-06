import { hospiceLinks, homeHealthLinks, palliativeCareLinks, memoryCareLinks, alilLinks } from './agencyLinks.js';

import Hospice from './hospice.js';
import HomeHealth from './home-health.js';
import PalliativeCare from './palliative-care.js';
import MemoryCare from './memory-care.js';
import ALIL from './ALIL.js';

export default async function Agency() {
  // Hospice(hospiceLinks);
  // HomeHealth(homeHealthLinks);
  // PalliativeCare(palliativeCareLinks);
  // MemoryCare(memoryCareLinks);
  ALIL(alilLinks);
}
