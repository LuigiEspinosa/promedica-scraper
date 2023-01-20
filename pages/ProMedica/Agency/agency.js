import {
  hospiceLinks,
  homeHealthLinks,
  palliativeCareLinks,
  memoryCareLinks,
} from './agencyLinks.js';

import Hospice from './hospice.js';
import HomeHealth from './home-health.js';
import PalliativeCare from './palliative-care.js';
import MemoryCare from './memory-care.js';

export default async function Agency() {
  // Hospice(hospiceLinks);
  // HomeHealth(homeHealthLinks);
  // PalliativeCare(palliativeCareLinks);
  MemoryCare(memoryCareLinks);
}
