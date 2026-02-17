import React from 'react';
import { Palette, Home, PenTool, Languages, Camera, Monitor, Video, BookOpen, Wind, Search, Lightbulb, PenLine, Rocket, Building2, Cpu, Globe, Zap, Gem, Feather, Anchor, Droplet, Code, Layout, Briefcase } from 'lucide-react';
import { Service, Project, TeamMember, Post, Testimonial, ProcessStep, Partner, Job } from './types';

export const SERVICES: Service[] = [
  {
    id: 'graphic',
    title: 'Graphic Design',
    titleKm: 'ការរចនាក្រាហ្វិក',
    subtitle: 'Branding & Visual Identity',
    subtitleKm: 'អត្តសញ្ញាណម៉ាកយីហោ',
    icon: <Palette size={32} />,
    color: 'bg-purple-500',
    link: '#',
    description: 'We bring your brand to life with stunning visuals. From logos to marketing materials, our designs are crafted to captivate and communicate your message effectively.',
    descriptionKm: 'យើងធ្វើឱ្យម៉ាកយីហោរបស់អ្នករស់រវើកជាមួយនឹងរូបភាពដ៏ស្រស់ស្អាត។ ចាប់ពីឡូហ្គោ រហូតដល់សម្ភារៈទីផ្សារ ការរចនារបស់យើងត្រូវបានបង្កើតឡើងដើម្បីទាក់ទាញ និងទំនាក់ទំនងសាររបស់អ្នកប្រកបដោយប្រសិទ្ធភាព។',
    features: ['Logo & Branding Identity', 'Social Media Graphics', 'Marketing Materials (Flyers, Brochures)', 'Packaging Design'],
    featuresKm: ['ឡូហ្គោ និងអត្តសញ្ញាណម៉ាក', 'ក្រាហ្វិកបណ្តាញសង្គម', 'សម្ភារៈទីផ្សារ (ប័ណ្ណផ្សព្វផ្សាយ)', 'ការរចនាការវេចខ្ចប់']
  },
  {
    id: 'architecture',
    title: 'Architecture',
    titleKm: 'ស្ថាបត្យកម្ម',
    subtitle: 'Sustainable & Modern Spaces',
    subtitleKm: 'លំហទំនើប និងនិរន្តរភាព',
    icon: <Home size={32} />,
    color: 'bg-indigo-500',
    link: '#',
    description: 'Blending functionality with aesthetics, we design spaces that inspire. Our architectural services cover everything from concept sketches to detailed blueprints.',
    descriptionKm: 'ការរួមបញ្ចូលគ្នារវាងមុខងារប្រើប្រាស់ និងសោភ័ណភាព យើងរចនាទីធ្លាដែលផ្តល់នូវការបំផុសគំនិត។ សេវាកម្មស្ថាបត្យកម្មរបស់យើងគ្របដណ្តប់លើអ្វីៗគ្រប់យ៉ាងចាប់ពីគំនូរព្រាងរហូតដល់ប្លង់លម្អិត។',
    features: ['Residential & Commercial Design', '3D Modeling & Rendering', 'Interior Design', 'Landscape Planning'],
    featuresKm: ['ការរចនាអគារលំនៅដ្ឋាន និងពាណិជ្ជកម្ម', 'ការបង្កើតម៉ូដែល 3D', 'ការរចនាផ្ទៃខាងក្នុង', 'ការរៀបចំសួនច្បារ']
  },
  {
    id: 'calligraphy',
    title: 'Arabic Calligraphy',
    titleKm: 'អក្សរផ្ចង់អារ៉ាប់',
    subtitle: 'Traditional Art & Digital Assets',
    subtitleKm: 'សិល្បៈប្រពៃណី និងឌីជីថល',
    icon: <PenTool size={32} />,
    color: 'bg-pink-500',
    link: '#',
    description: 'Masterful Arabic calligraphy for art pieces, logos, and digital media. We combine traditional rules with modern flair.',
    descriptionKm: 'អក្សរផ្ចង់អារ៉ាប់ដ៏ប៉ិនប្រសប់សម្រាប់ស្នាដៃសិល្បៈ ឡូហ្គោ និងប្រព័ន្ធផ្សព្វផ្សាយឌីជីថល។ យើងរួមបញ្ចូលគ្នានូវច្បាប់ប្រពៃណីជាមួយនឹងរចនាប័ទ្មទំនើប។',
    features: ['Custom Name Design', 'Logo Calligraphy', 'Wall Art & Decoration', 'Digital Calligraphy Assets'],
    featuresKm: ['ការរចនាឈ្មោះ', 'ឡូហ្គោអក្សរផ្ចង់', 'សិល្បៈជញ្ជាំង និងការតុបតែង', 'ធនធានអក្សរផ្ចង់ឌីជីថល']
  },
  {
    id: 'translation',
    title: 'Translation Services',
    titleKm: 'សេវាកម្មបកប្រែ',
    subtitle: 'Professional & Accurate',
    subtitleKm: 'វិជ្ជាជីវៈ និងត្រឹមត្រូវ',
    icon: <Languages size={32} />,
    color: 'bg-orange-500',
    link: '#',
    description: 'Accurate and culturally nuanced translation services. We bridge the gap between languages to help you reach a global audience.',
    descriptionKm: 'សេវាកម្មបកប្រែដែលមានភាពត្រឹមត្រូវ និងយល់ពីវប្បធម៌។ យើងផ្សារភ្ជាប់គម្លាតរវាងភាសា ដើម្បីជួយអ្នកទៅដល់ទស្សនិកជនសកល។',
    features: ['Document Translation (Khmer, English, Arabic)', 'Simultaneous Interpretation', 'Website Localization', 'Legal & Technical Translation'],
    featuresKm: ['ការបកប្រែឯកសារ (ខ្មែរ អង់គ្លេស អារ៉ាប់)', 'ការបកប្រែផ្ទាល់មាត់', 'ការធ្វើឱ្យវេបសាយមានលក្ខណៈតំបន់', 'ការបកប្រែច្បាប់ និងបច្ចេកទេស']
  },
  {
    id: 'media',
    title: 'Video & Photo',
    titleKm: 'ផលិតវីដេអូ និងថតរូប',
    subtitle: 'Capturing Moments',
    subtitleKm: 'ផ្តិតយកពេលវេលា',
    icon: <Camera size={32} />,
    color: 'bg-blue-500',
    link: '#',
    description: 'High-quality photography and videography services to capture moments and tell your story through a cinematic lens.',
    descriptionKm: 'សេវាកម្មថតរូប និងវីដេអូដែលមានគុណភាពខ្ពស់ ដើម្បីផ្តិតយកពេលវេលាដ៏សំខាន់ និងប្រាប់រឿងរ៉ាវរបស់អ្នកតាមរយៈកែវភ្នែកភាពយន្ត។',
    features: ['Event Photography', 'Commercial Video Production', 'Video Editing & Post-Production', 'Product Photography'],
    featuresKm: ['ការថតរូបក្នុងកម្មវិធី', 'ផលិតវីដេអូពាណិជ្ជកម្ម', 'ការកាត់តវីដេអូ', 'ការថតរូបផលិតផល']
  },
  {
    id: 'courses',
    title: 'Online Courses',
    titleKm: 'វគ្គសិក្សាអនឡាញ',
    subtitle: 'Learn from Experts',
    subtitleKm: 'រៀនពីអ្នកជំនាញ',
    icon: <BookOpen size={32} />,
    color: 'bg-emerald-500',
    link: '#',
    description: 'Learn new skills from industry experts. Our online courses are designed to be practical, engaging, and accessible anywhere.',
    descriptionKm: 'រៀនជំនាញថ្មីពីអ្នកជំនាញក្នុងវិស័យ។ វគ្គសិក្សាអនឡាញរបស់យើងត្រូវបានរចនាឡើងដើម្បីឱ្យមានការអនុវត្តជាក់ស្តែង គួរឱ្យចាប់អារម្មណ៍ និងអាចចូលរៀនបានគ្រប់ទីកន្លែង។',
    features: ['Graphic Design Masterclass', 'Web Development Bootcamp', 'Language Learning', 'Architecture Basics'],
    featuresKm: ['ថ្នាក់ជំនាញរចនាក្រាហ្វិក', 'វគ្គបណ្តុះបណ្តាលវេបសាយ', 'ការរៀនភាសា', 'មូលដ្ឋានគ្រឹះស្ថាបត្យកម្ម']
  },
  {
    id: 'webdev',
    title: 'Web & App',
    titleKm: 'អភិវឌ្ឍគេហទំព័រ',
    subtitle: 'Scalable Digital Solutions',
    subtitleKm: 'ដំណោះស្រាយឌីជីថល',
    icon: <Monitor size={32} />,
    color: 'bg-yellow-500',
    link: '#',
    description: 'We build robust, scalable, and beautiful websites and mobile applications tailored to your business needs.',
    descriptionKm: 'យើងបង្កើតគេហទំព័រ និងកម្មវិធីទូរស័ព្ទដែលមានភាពរឹងមាំ អាចពង្រីកបាន និងស្រស់ស្អាត ដែលតម្រូវតាមតម្រូវការអាជីវកម្មរបស់អ្នក។',
    features: ['Custom Website Development', 'Mobile App Development (iOS/Android)', 'E-commerce Solutions', 'UI/UX Design'],
    featuresKm: ['ការអភិវឌ្ឍវេបសាយតាមតម្រូវការ', 'ការអភិវឌ្ឍកម្មវិធីទូរស័ព្ទ', 'ដំណោះស្រាយពាណិជ្ជកម្មអេឡិចត្រូនិក', 'ការរចនា UI/UX']
  },
    {
    id: 'mvac',
    title: 'MVAC Design',
    titleKm: 'ប្រព័ន្ធម៉ាស៊ីនត្រជាក់',
    subtitle: 'Climate Control Systems',
    subtitleKm: 'ប្រព័ន្ធគ្រប់គ្រងអាកាសធាតុ',
    icon: <Wind size={32} />,
    color: 'bg-cyan-500',
    link: '#',
    description: 'Expert design and consulting for Mechanical, Ventilation, and Air Conditioning systems to ensure optimal comfort and efficiency.',
    descriptionKm: 'ការរចនា និងការប្រឹក្សាយោបល់ជំនាញសម្រាប់ប្រព័ន្ធមេកានិច ម៉ាស៊ីនត្រជាក់ និងខ្យល់ ដើម្បីធានាបាននូវផាសុកភាព និងប្រសិទ្ធភាពខ្ពស់បំផុត។',
    features: ['HVAC System Design', 'Energy Efficiency Consulting', 'Installation Planning', 'Maintenance Schedules'],
    featuresKm: ['ការរចនាប្រព័ន្ធ HVAC', 'ការប្រឹក្សាអំពីប្រសិទ្ធភាពថាមពល', 'ការរៀបចំផែនការដំឡើង', 'កាលវិភាគថែទាំ']
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Book Art Design',
    category: 'website',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi81tg3VCyPdGdmmHdbUTf5GeNwi0bI28uJ6F5H-_Jj8TSGZFchga1miJvW0blcvp0e33B0SyNoxGRNp-sf7gev3yZSx8YR8giKDUmxfX_ffqmM6ZdM-xtrXwNburJn3r6g-Rr_DX5IEGSht-0N9eSQzh7pXgLstekmoRUM5q4drRghQTLAdRh6b2B6dqA/s1600/fb%20cover.jpg',
    slug: 'book-art-design'
  },
  {
    id: 'p2',
    title: 'Social Media Poster',
    category: 'graphicdesign',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgBNO6soY5uydiJo7csDhel8zSlg3q7DIFAA6rSIF44qJyBsv2WD8eUGu5ZYDuJu1I1NppTG70NNW0PIHbXxjvBTygXJGVMBLIpjID9__SVIA_Roox9_A8Z6yqBYsSBXRQoRfPotUJnTBo8c_1YG6Ui3Aa5ohGt-7z7f-ciJQwEIwA7njLehAGhClTflSzs/s1600/ponloe.poster.jpg',
    slug: 'social-media-poster'
  },
  {
    id: 'p3',
    title: 'Ponloe Creative Web',
    category: 'webapp',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiuEcfaETv68lAV6WDzh7Gub7lzi2fwpPjmPmcq0EMklRIUB4K8t4rHJBcB7uAK_LMpvQnJpuFV8T_XjnDSoSEIII9FDpOFBU4i1hRpWCxYW5QQQmFoRTRneazGjdgZT8ZME6cDx652INDsd2s6FnV9DiiKyo40XwgHA5gRXn1QM0pD0gr440JEjV1pock/s1600/ponloe.jpg',
    slug: 'ponloe-creative-web'
  },
  {
    id: 'p4',
    title: 'Islamic School',
    category: 'architecture',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7Ps8IhveUmB9RFKJYQCvOzWQH3j5nb7cByL7PjJD3tIN7oRsEkP0HLIKB0j1sNyVPrJF6c6M8rv7CH2XUI38_6x7xgecWFFZy07bLfh3kodS1759LxMRcghxElhyj3AJCMoCbRpW5-JlllAG6iAaYOP4UXFbAQtcnAHFOs-F-zBtiOkGKXTeBqPFz1xc/s320/near%20pic.png',
    slug: 'islamic-school-architecture'
  },
  {
    id: 'p5',
    title: 'Air System',
    category: 'mvac',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEigqOTALAa-2e4EfpXN9r_wBNE6ZdiSf69XjUIrkVioxdSVafgPdvfJLglejFykZ4XUrrdxZUunKv8cFE-pFT1EMqWtj-BTLmgiE8LHrG3-oLfVZ72B7WRe6JxxHLQKqSfe1qRuo1Xf6TaeCFLqZbEnbZnN5PYss-2uc6Fej9cZy53ZrQjj9ubeSDVZpz4/s320/image_2025-11-23_23-35-04.png',
    slug: 'air-system-design'
  },
   {
    id: 'p6',
    title: 'Arabic Calligraphy Art',
    category: 'arabiccalligraphy',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgdO1wHd0pb8bMDmGo2Br1-wfWpBvUfvlm6Ze6pu0je9j8cUwNlEeCeAhUXHr7H1eKv_ptkZr-RQv5HLqB-r77Rex_Lxpzs9vr1a3S7ICb61ycbSwX_DeeWMOlFFrEy1ljUu9pUu2DjWyEjKZ4me6WWSXDXuCmgB2K_XeMNMNglN4-GqBVIydnFx0qxDYQ/s1600/486282539_1128936618973719_3554373107042098501_n.jpg',
    slug: 'arabic-calligraphy-art'
  },
  {
    id: 'p7',
    title: 'Gohome App',
    category: 'webapp',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi_utIYD5sz6iR93lfrMGuMmO9K-0UZf8i7rNbnmJRfuFtng7gOWiqF2McMUptkaVOk04KkBxAyZxo1YGFWg6QqbrcsZ7W-H4LohazfWeNsttcjN2rPsdAQ8jAoicidnXtPz_S6lqNBb8JOGbiu48ZdM-xtrXwNburJn3r6g-Rr_DX5IEGSht-0N9eSQzh7pXgLstekmoRUM5q4drRghQTLAdRh6b2B6dqA/s1600/Gohome.jpg',
    slug: 'gohome-app'
  }
];

export const TEAM: TeamMember[] = [
  {
    id: 't1',
    name: 'Youshow',
    role: 'Lead Web/App Developer',
    roleKm: 'អភិវឌ្ឍគេហទំព័រ និងកម្មវិធី',
    image: 'https://img.ponloe.org/creative/team/youshow.jpg',
    socials: { facebook: 'https://fb.com/You2Show', telegram: 'https://t.me/khmermuslim' },
    bio: 'Passionate full-stack developer with a focus on scalable web and mobile applications. Driven by innovation and code excellence.',
    bioKm: 'អ្នកអភិវឌ្ឍន៍ Full-stack ដែលមានចំណង់ចំណូលចិត្តក្នុងការបង្កើតកម្មវិធីវេបសាយ និងទូរស័ព្ទដែលមានគុណភាពខ្ពស់។',
    skills: ['React', 'Next.js', 'Flutter', 'Node.js', 'PostgreSQL'],
    experience: ['Lead Developer at Ponloe (5 Years)', 'Freelance Senior Dev (3 Years)', 'Tech Consultant'],
    experienceKm: ['អ្នកអភិវឌ្ឍន៍នាំមុខនៅ Ponloe (៥ ឆ្នាំ)', 'អ្នកអភិវឌ្ឍន៍ឯករាជ្យជាន់ខ្ពស់ (៣ ឆ្នាំ)', 'ទីប្រឹក្សាបច្ចេកវិទ្យា'],
    slug: 'youshow'
  },
  {
    id: 't2',
    name: 'Samry',
    role: 'Lead Graphic Designer',
    roleKm: 'អ្នករចនាក្រាហ្វិក',
    image: 'https://img.ponloe.org/creative/team/samry.jpg',
    socials: { facebook: 'https://fb.com/miss.you.545402', telegram: 'https://t.me/SOS_SAMRY' },
    bio: 'Creative visionary transforming ideas into visual reality through branding and graphic design. An artist with a digital canvas.',
    bioKm: 'អ្នកមានគំនិតច្នៃប្រឌិតក្នុងការប្រែក្លាយគំនិតទៅជាការពិតតាមរយៈការបង្កើតម៉ាកយីហោ និងការរចនាក្រាហ្វិក។',
    skills: ['Adobe Photoshop', 'Illustrator', 'Brand Identity', 'UI Design', 'Typography'],
    experience: ['Senior Graphic Designer (4 Years)', 'Art Director', 'Freelance Illustrator'],
    experienceKm: ['អ្នករចនាក្រាហ្វិកជាន់ខ្ពស់ (៤ ឆ្នាំ)', 'នាយកសិល្បៈ', 'អ្នកគូររូបឯករាជ្យ'],
    slug: 'samry'
  },
  {
    id: 't3',
    name: 'Sreyneang',
    role: 'Lead Architecture',
    roleKm: 'ស្ថាបត្យកម្ម',
    image: 'https://img.ponloe.org/creative/team/sreyneang.jpg',
    socials: { facebook: 'https://fb.com/penh.sreyneang.2025', telegram: 'https://t.me/Penh_sreyneang' },
    bio: 'Architect dedicated to sustainable and functional design that respects local culture. Building spaces that inspire.',
    bioKm: 'ស្ថាបត្យករដែលប្តេជ្ញាចិត្តចំពោះការរចនាដែលមាននិរន្តរភាព និងមុខងារប្រើប្រាស់ ដោយគោរពតាមវប្បធម៌ក្នុងស្រុក។',
    skills: ['AutoCAD', 'SketchUp', 'Lumion', 'Interior Design', 'Project Planning'],
    experience: ['Lead Architect (3 Years)', 'Residential Project Manager', 'Urban Planning Intern'],
    experienceKm: ['ស្ថាបត្យករនាំមុខ (៣ ឆ្នាំ)', 'អ្នកគ្រប់គ្រងគម្រោងលំនៅដ្ឋាន', 'កម្មសិក្សាការរៀបចំផែនការទីក្រុង'],
    slug: 'sreyneang'
  },
  {
    id: 't4',
    name: 'Faisol',
    role: 'Lead Translation Services',
    roleKm: 'អ្នកបកប្រែ',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgTQdoxo2hBNR7YI1wYlvQmPGpSsfay_XU1yG12utm9q4VurQX_BkX8W_seJ4wNzi99d9XHIiQMEeQfl3O892ZFLEUZgeRXp3Ut7stWQY89PvbDH_WoC-ea2n8jHVO-bN6xYJ8ZH0YmUUaV11Fj6vYNtqEQnZr_SoXGHNBuJT_tYDo9b0cxDg83ZZJ01pY/s1600/IMG_20260104_151731_010.png',
    socials: { facebook: 'https://fb.com/faisalalchampavi', telegram: 'https://t.me/faisalalchampavi' },
    bio: 'Expert linguist bridging communication gaps between Arabic, English, and Khmer speakers. Ensuring clarity and cultural accuracy.',
    bioKm: 'អ្នកជំនាញភាសាដែលផ្សារភ្ជាប់គម្លាតទំនាក់ទំនងរវាងអ្នកនិយាយភាសាអារ៉ាប់ អង់គ្លេស និងខ្មែរ។',
    skills: ['Simultaneous Interpretation', 'Document Translation', 'Editing', 'Cultural Consulting'],
    experience: ['Certified Translator (5 Years)', 'Education Consultant', 'Language Instructor'],
    experienceKm: ['អ្នកបកប្រែដែលមានការទទួលស្គាល់ (៥ ឆ្នាំ)', 'ទីប្រឹក្សាអប់រំ', 'គ្រូបង្រៀនភាសា'],
    slug: 'faisol'
  },
   {
    id: 't5',
    name: 'Adib Gazaly',
    role: 'Translation Team',
    roleKm: 'អ្នកបកប្រែ',
    image: 'https://img.ponloe.org/creative/team/adibgazaly.jpg',
    socials: { facebook: 'https://www.facebook.com/share/1Z7uSXTe2o/', telegram: 'https://t.me/Abuhumaidi' },
    bio: 'Dedicated translator ensuring accuracy and cultural relevance in every document. Detail-oriented and reliable.',
    bioKm: 'អ្នកបកប្រែដែលយកចិត្តទុកដាក់ធានានូវភាពត្រឹមត្រូវ និងភាពសមស្របតាមវប្បធម៌នៅក្នុងឯកសារនីមួយៗ។',
    skills: ['Translation', 'Proofreading', 'Content Localization', 'Research'],
    experience: ['Translation Specialist (2 Years)', 'Content Writer', 'Editor'],
    experienceKm: ['អ្នកឯកទេសបកប្រែ (២ ឆ្នាំ)', 'អ្នកសរសេរអត្ថបទ', 'អ្នកកែសម្រួល'],
    slug: 'adib-gazaly'
  },
  {
    id: 't6',
    name: 'Sait Abdulvasea',
    role: 'MVAC Designer',
    roleKm: 'អ្នករចនា MVAC',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWA5K2kspL_-HNLwWk6oCuXO1CAZJ9NQkCLzsc0Jgef6CJhNTcKUYYyHN2fzFYFjcUH8nqjxfMY-Q9xSQFVgOOxty4dcd54CV8K6j7IBnikZTIQOrlrCzCnoSz2nTte6sOvKYWmXwvqh153SbeEMp7tCYt-OSAsIm5qFMwRn7nZIvx3Ydi8D52aTod800/s1600/Generated%20Image%20November%2030,%202025%20-%2011_47PM%20%281%29.png',
    socials: { facebook: 'https://fb.com/abdulvasea.sait' },
    bio: 'Engineer focused on efficient and comfortable climate control systems. Designing for optimal airflow and energy saving.',
    bioKm: 'វិស្វករដែលផ្តោតលើប្រព័ន្ធគ្រប់គ្រងអាកាសធាតុប្រកបដោយប្រសិទ្ធភាព និងផាសុកភាព។',
    skills: ['HVAC Design', 'AutoCAD MEP', 'Energy Efficiency', 'System Installation'],
    experience: ['MVAC Engineer (3 Years)', 'Site Supervisor', 'System Analyst'],
    experienceKm: ['វិស្វករ MVAC (៣ ឆ្នាំ)', 'អ្នកត្រួតពិនិត្យការដ្ឋាន', 'អ្នកវិភាគប្រព័ន្ធ'],
    slug: 'sait-abdulvasea'
  }
];

export const JOBS: Job[] = [
    {
        id: 'j1',
        title: "Senior Frontend Developer",
        type: "Full-time",
        location: "Phnom Penh / Remote",
        department: "Engineering",
        icon: 'Code',
        link: 'mailto:creative.ponloe.org@gmail.com?subject=Application for Senior Frontend Developer'
    },
    {
        id: 'j2',
        title: "UI/UX Designer",
        type: "Full-time",
        location: "Phnom Penh",
        department: "Design",
        icon: 'PenTool',
        link: 'mailto:creative.ponloe.org@gmail.com?subject=Application for UI/UX Designer'
    },
    {
        id: 'j3',
        title: "Architectural Intern",
        type: "Internship",
        location: "Phnom Penh",
        department: "Architecture",
        icon: 'Layout',
        link: 'mailto:creative.ponloe.org@gmail.com?subject=Application for Architectural Intern'
    }
];

export const INSIGHTS: Post[] = [
  {
    id: 'post_code_1',
    title: 'Modern CSS Glassmorphism Generator',
    titleKm: 'បង្កើត Glassmorphism ទំនើបជាមួយ CSS',
    excerpt: 'Copy and paste this production-ready CSS code to give your website that premium frosted glass look immediately.',
    date: 'March 20, 2025',
    category: 'Code',
    authorId: 't1',
    image: 'https://images.unsplash.com/photo-1550063873-ab792950096b?auto=format&fit=crop&q=80&w=800',
    link: '#',
    content: "Creating a stunning glassmorphism effect is easier than you think. It adds depth and a premium feel to your UI.\n\nHere is the exact CSS snippet we use at Ponloe Creative for our cards and modals:\n\n" + 
             "```css\n/* Glassmorphism Card Style */\n.glass-panel {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);\n  border-radius: 24px;\n}\n\n/* Dark Mode Support */\n@media (prefers-color-scheme: dark) {\n  .glass-panel {\n    background: rgba(0, 0, 0, 0.2);\n    border: 1px solid rgba(255, 255, 255, 0.05);\n  }\n}\n```" +
             "\n\nSimply copy this class into your stylesheet and apply it to any `div` element. The `backdrop-filter` property does the heavy lifting by blurring whatever is behind the element.\n\n**Pro Tip:** Add a subtle noise texture overlay to make it look even more cinematic!",
    comments: [],
    slug: 'modern-css-glassmorphism-generator'
  },
  // ... rest of posts (kept same)
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'tm1',
    name: 'Sokha Chan',
    role: 'Marketing Director',
    company: 'Khmer Enterprise',
    content: "Ponloe Creative transformed our digital presence. Their attention to detail and understanding of Khmer culture is unmatched.",
    contentKm: "Ponloe Creative បានផ្លាស់ប្តូរវត្តមានឌីជីថលរបស់យើង។ ការយកចិត្តទុកដាក់របស់ពួកគេលើព័ត៌មានលម្អិត និងការយល់ដឹងពីវប្បធម៌ខ្មែរគឺពិតជាល្អឯក។",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 'tm2',
    name: 'David Miller',
    role: 'CEO',
    company: 'Angkor Tech Solutions',
    content: "The best agency we've worked with in Southeast Asia. Professional, timely, and incredibly talented.",
    contentKm: "ភ្នាក់ងារដែលល្អបំផុតដែលយើងធ្លាប់សហការនៅអាស៊ីអាគ្នេយ៍។ មានវិជ្ជាជីវៈ ទាន់ពេលវេលា និងមានទេពកោសល្យខ្ពស់។",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 'tm3',
    name: 'Bopha Vong',
    role: 'Founder',
    company: 'Lotus Spa',
    content: "Our booking system is now seamless thanks to their web dev team. Revenue increased by 40% in just two months.",
    contentKm: "ប្រព័ន្ធកក់របស់យើងឥឡូវនេះដំណើរការយ៉ាងរលូន ដោយសារក្រុមអភិវឌ្ឍន៍វេបសាយរបស់ពួកគេ។ ប្រាក់ចំណូលកើនឡើង ៤០% ត្រឹមតែ ២ ខែប៉ុណ្ណោះ។",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 'tm4',
    name: 'Sarah Chen',
    role: 'Project Manager',
    company: 'Global Development',
    content: "The architectural rendering provided for our new eco-resort was breathtaking. Highly recommended!",
    contentKm: "ប្លង់ស្ថាបត្យកម្មសម្រាប់រមណីយដ្ឋានធម្មជាតិថ្មីរបស់យើងពិតជាអស្ចារ្យណាស់។ សូមណែនាំយ៉ាងខ្លាំង!",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  }
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'ps1',
    number: '01',
    title: 'Discovery',
    titleKm: 'ការសិក្សា',
    description: 'We start by understanding your goals, audience, and challenges.',
    descriptionKm: 'យើងចាប់ផ្តើមដោយការស្វែងយល់ពីគោលដៅ ទស្សនិកជន និងបញ្ហាប្រឈមរបស់អ្នក។',
    icon: <Search size={24} />,
  },
  {
    id: 'ps2',
    number: '02',
    title: 'Strategy',
    titleKm: 'យុទ្ធសាស្ត្រ',
    description: 'Developing a tailored roadmap to achieve success.',
    descriptionKm: 'ការបង្កើតផែនទីបង្ហាញផ្លូវដែលតម្រូវតាមតម្រូវការ ដើម្បីសម្រេចបានជោគជ័យ។',
    icon: <Lightbulb size={24} />,
  },
  {
    id: 'ps3',
    number: '03',
    title: 'Creation',
    titleKm: 'ការបង្កើត',
    description: 'Our experts design, build, and refine your solution.',
    descriptionKm: 'អ្នកជំនាញរបស់យើងរចនា បង្កើត និងកែលម្អដំណោះស្រាយរបស់អ្នក។',
    icon: <PenLine size={24} />,
  },
  {
    id: 'ps4',
    number: '04',
    title: 'Launch',
    titleKm: 'ការដាក់ឱ្យដំណើរការ',
    description: 'Testing, deploying, and optimizing for maximum impact.',
    descriptionKm: 'ការសាកល្បង ការដាក់ពង្រាយ និងការបង្កើនប្រសិទ្ធភាពសម្រាប់ផលប៉ះពាល់ជាអតិបរមា។',
    icon: <Rocket size={24} />,
  },
];

export const PARTNERS: Partner[] = [
    { id: '1', name: 'Khmer Enterprise', icon: <Building2 size={32} /> },
    { id: '2', name: 'Angkor Tech', icon: <Cpu size={32} /> },
    { id: '3', name: 'Global Dev', icon: <Globe size={32} /> },
    { id: '4', name: 'Lotus Spa', icon: <Droplet size={32} /> },
    { id: '5', name: 'Smart Axiata', icon: <Zap size={32} /> },
    { id: '6', name: 'Chip Mong', icon: <Gem size={32} /> },
    { id: '7', name: 'Vattanac Bank', icon: <Building2 size={32} /> },
    { id: '8', name: 'Brown Coffee', icon: <Feather size={32} /> },
    { id: '9', name: 'Sihanutville Port', icon: <Anchor size={32} /> },
];
