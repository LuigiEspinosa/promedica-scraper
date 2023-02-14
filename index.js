import PressReleases from './pages/ProMedica/Newsroom/press-releases.js';
import News from './pages/ProMedica/Newsroom/news.js';
import OurStories from './pages/ProMedica/Newsroom/our-stories.js';
import Locations from './pages/ProMedica/Locations/locations.js';
import DoctorsProviders from './pages/ProMedica/doctors/doctors.js';
import ServicesConditions from './pages/ProMedica/ServicesConditions/services-conditions.js';
import EducationalArticles from './pages/Paramount/EducationalArticles/educational-articles.js';
import ParamountNews from './pages/Paramount/News/news.js';
import ParamountBlog from './pages/Paramount/Blog/blog.js';
import Agency from './pages/ProMedica/Agency/agency.js';

// ProMedica
await PressReleases();
await News();
await OurStories();
await Locations();
await DoctorsProviders();
await ServicesConditions();
await Agency();

// Paramount
await EducationalArticles();
await ParamountNews();
await ParamountBlog();
