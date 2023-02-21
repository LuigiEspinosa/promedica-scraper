import { hospiceLinks, homeHealthLinks, palliativeCareLinks, memoryCareLinks, alilLinks, skilledNursingLinks } from './agencyLinks.js';

import Hospice from './hospice.js';
import HomeHealth from './home-health.js';
import PalliativeCare from './palliative-care.js';
import MemoryCare from './memory-care.js';
import ALIL from './ALIL.js';
import SkilledNursing from './skilled-nursing.js';

export default async function Agency() {
  await Hospice(hospiceLinks);
  await HomeHealth(homeHealthLinks);
  await PalliativeCare(palliativeCareLinks);
  await MemoryCare(memoryCareLinks);
  await ALIL(alilLinks);
  await SkilledNursing(skilledNursingLinks);
}
