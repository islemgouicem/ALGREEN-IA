/** All content is local until the backend returns. Numbers below are placeholders. */

export const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Sétif", "Saïda",
  "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
  "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun",
  "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa",
];

export interface Campaign {
  id: string; name: string; association: string; wilaya: string; location: string; goal: number; planted: number;
  participants: number; start: string; end: string; rating: number; species: string[]; area: number; description: string; relevance: number;
}

export const CAMPAIGNS: Campaign[] = [
  { id: "chrea-cedar-return", name: "Chréa Cedar Return", association: "Eldjazayer Elkhadra", wilaya: "Blida", location: "Chréa National Park", goal: 1200, planted: 340, participants: 64, start: "2026-11-21", end: "2027-02-14", rating: 5, species: ["Atlas cedar", "Holm oak"], area: 18, relevance: 98, description: "Replanting Atlas cedar on the fire-scarred northern slopes of Chréa, using seedlings grown from local cones." },
  { id: "djelfa-green-dam", name: "Green Dam Renewal", association: "Barrage Vert Citoyen", wilaya: "Djelfa", location: "Moudjbara steppe", goal: 5000, planted: 1810, participants: 143, start: "2026-12-05", end: "2027-03-20", rating: 5, species: ["Aleppo pine", "Tamarisk"], area: 120, relevance: 95, description: "Filling the gaps in the 1970s tree belt, with a mix of species instead of the old pine monoculture." },
  { id: "souf-palm-line", name: "Oued Souf Palm Line", association: "Oasis Vivante", wilaya: "El Oued", location: "Ghout gardens", goal: 1720, planted: 1720, participants: 88, start: "2026-11-15", end: "2026-12-30", rating: 4, species: ["Date palm", "Tamarisk"], area: 26, relevance: 90, description: "A windbreak of date palms and tamarisk protecting the sunken ghout gardens from drifting sand." },
  { id: "akfadou-oak", name: "Akfadou Oak Recovery", association: "Forêts de Kabylie", wilaya: "Béjaïa", location: "Akfadou forest", goal: 900, planted: 210, participants: 47, start: "2027-01-09", end: "2027-03-01", rating: 4, species: ["Cork oak", "Holm oak"], area: 14, relevance: 86, description: "Volunteers return native oak to clearings opened by summer fires, then return each spring to check survival." },
  { id: "edough-cork", name: "Edough Cork Belt", association: "Annaba Verte", wilaya: "Annaba", location: "Edough massif", goal: 650, planted: 120, participants: 31, start: "2026-12-12", end: "2027-02-08", rating: 4, species: ["Cork oak"], area: 9, relevance: 80, description: "A cork oak corridor reconnecting two forest patches on the Edough massif above the coast." },
  { id: "murdjadjo-pines", name: "Murdjadjo Hillside", association: "Oran Racines", wilaya: "Oran", location: "Djebel Murdjadjo", goal: 500, planted: 505, participants: 73, start: "2026-11-28", end: "2027-01-10", rating: 5, species: ["Aleppo pine", "Carob"], area: 7, relevance: 78, description: "Holding the soil on the slopes above Oran with pine and carob." },
  { id: "elbayadh-steppe", name: "El Bayadh Steppe Shield", association: "Hauts Plateaux Verts", wilaya: "El Bayadh", location: "Brezina road", goal: 1303, planted: 1303, participants: 96, start: "2026-11-18", end: "2027-01-25", rating: 5, species: ["Acacia", "Tamarisk"], area: 32, relevance: 75, description: "A low shield of drought-hardy species along the Brezina road to slow sand movement." },
  { id: "tlemcen-holm", name: "Tlemcen Holm Oak Terraces", association: "Jeunes de Tlemcen", wilaya: "Tlemcen", location: "Lalla Setti plateau", goal: 300, planted: 42, participants: 18, start: "2027-01-23", end: "2027-03-15", rating: 3, species: ["Holm oak", "Olive"], area: 4, relevance: 70, description: "Small terraces of holm oak and olive with dry-stone edges to catch rainfall." },
  { id: "sidi-abdellah-grove", name: "Sidi Abdellah Campus Grove", association: "Algreenia Students", wilaya: "Algiers", location: "Sidi Abdellah campus", goal: 100, planted: 58, participants: 9, start: "2026-12-19", end: "2027-01-31", rating: 5, species: ["Carob", "Almond", "Olive"], area: 1, relevance: 68, description: "The grove where Algreenia began. Each student adopts one tree and logs its watering." },
  { id: "msila-505", name: "M'Sila Six Provinces", association: "Eldjazayer Elkhadra", wilaya: "M'Sila", location: "Chott el Hodna edge", goal: 800, planted: 505, participants: 112, start: "2026-12-26", end: "2027-02-20", rating: 4, species: ["Tamarisk", "Acacia"], area: 11, relevance: 64, description: "Volunteers from six provinces extend the planting line along the edge of the Chott el Hodna." },
  { id: "aures-seedbank", name: "Aurès Seed Bank Walk", association: "Aurès Nature", wilaya: "Batna", location: "Belezma National Park", goal: 250, planted: 15, participants: 8, start: "2027-02-06", end: "2027-03-28", rating: 3, species: ["Atlas cedar"], area: 3, relevance: 58, description: "Collect, label and sow cedar seed from the old stands of Belezma." },
  { id: "tizi-olive", name: "Tizi Ouzou Olive Terraces", association: "Forêts de Kabylie", wilaya: "Tizi Ouzou", location: "Aït Yenni", goal: 400, planted: 96, participants: 26, start: "2027-02-13", end: "2027-03-30", rating: 4, species: ["Olive", "Carob"], area: 5, relevance: 52, description: "Restoring burned family olive terraces with the villages who farm them." },
];

export interface IrrigationCampaign { id: string; name: string; wilaya: string; lastIrrigatedDaysAgo: number; trees: { name: string; planted: number; interval: number }[] }

export const IRRIGATION: IrrigationCampaign[] = [
  { id: "chrea-cedar-return", name: "Chréa Cedar Return", wilaya: "Blida", lastIrrigatedDaysAgo: 3, trees: [{ name: "Atlas cedar", planted: 240, interval: 10 }, { name: "Holm oak", planted: 100, interval: 12 }] },
  { id: "djelfa-green-dam", name: "Green Dam Renewal", wilaya: "Djelfa", lastIrrigatedDaysAgo: 11, trees: [{ name: "Aleppo pine", planted: 1400, interval: 8 }, { name: "Tamarisk", planted: 410, interval: 14 }] },
  { id: "souf-palm-line", name: "Oued Souf Palm Line", wilaya: "El Oued", lastIrrigatedDaysAgo: 7, trees: [{ name: "Date palm", planted: 1200, interval: 4 }, { name: "Tamarisk", planted: 520, interval: 14 }] },
  { id: "murdjadjo-pines", name: "Murdjadjo Hillside", wilaya: "Oran", lastIrrigatedDaysAgo: 5, trees: [{ name: "Aleppo pine", planted: 380, interval: 8 }, { name: "Carob", planted: 125, interval: 12 }] },
  { id: "elbayadh-steppe", name: "El Bayadh Steppe Shield", wilaya: "El Bayadh", lastIrrigatedDaysAgo: 9, trees: [{ name: "Acacia", planted: 900, interval: 9 }, { name: "Tamarisk", planted: 403, interval: 14 }] },
  { id: "sidi-abdellah-grove", name: "Sidi Abdellah Campus Grove", wilaya: "Algiers", lastIrrigatedDaysAgo: 1, trees: [{ name: "Carob", planted: 20, interval: 12 }, { name: "Almond", planted: 18, interval: 7 }, { name: "Olive", planted: 20, interval: 10 }] },
];

export const STEPS = [
  { stage: "Germinate", title: "Sign up and join the community", body: "Create an account to become part of Algreenia and reach its afforestation tools and projects.", href: "/signup", cta: "Create an account" },
  { stage: "Root", title: "Discover afforestation projects", body: "Explore campaigns you can join, filtered by your wilaya, your interest, or the size of the effort.", href: "/campaigns", cta: "Browse campaigns" },
  { stage: "Sprout", title: "Choose a project to support", body: "Pick a campaign that matches you, whether you bring a shovel or support it another way.", href: "/campaigns", cta: "Find a project" },
  { stage: "Leaf", title: "Get your tree recommendation", body: "Answer four questions about your land, and get species that will actually survive there.", href: "/recommend", cta: "Take the quiz" },
  { stage: "Branch", title: "Track your impact", body: "After you join, follow the trees planted, the water saved, and the community's combined progress.", href: "/impact", cta: "See the impact" },
  { stage: "Canopy", title: "Share what you grew", body: "Show your progress, and bring friends, family and colleagues into the next planting.", href: "/about", cta: "Our story" },
];

export const STORIES = [
  { value: "505", unit: "trees", place: "M'Sila", title: "In just one day, we united six provinces for a greener Algeria!", image: "/img/photos/story-msila.jpg", alt: "Green steppe below a flat-topped mountain near Bou Saada" },
  { value: "1,720", unit: "trees", place: "Oued Souf", title: "Now, ten of these trees proudly bear my name!", image: "/img/photos/story-souf.jpg", alt: "Date palms in an oasis under a deep blue sky" },
  { value: "1,303", unit: "trees", place: "El Bayadh", title: "Our province is now greener than ever thanks to Algreenia!", image: "/img/photos/story-bayadh.jpg", alt: "A broad umbrella thorn tree on open dry land" },
];

export const TEAM = [
  { name: "Haithem Bouziane", role: "Web Developer", tag: "Creative Designer", note: "Brings creativity and innovation to every project, so the result is unique and has real impact.", image: "/img/ana.jpg" },
  { name: "Enzo Chaabnia", role: "Frontend Developer", tag: "JavaScript Enthusiast", note: "With a strong foundation in JavaScript, delivers web applications that feel seamless.", image: "/img/ENZO.jpg" },
  { name: "Salah Badreddine", role: "Backend Developer", tag: "Backend Specialist", note: "Keeps data handling and servers efficient, powering the core of the platform.", image: "/img/salah.jpeg" },
  { name: "Islem Gouicem", role: "Full-Stack Developer", tag: "Full-Stack Engineer", note: "Combines frontend and backend to solve problems at every layer of the product.", image: "/img/ISLAM.jpg" },
];

export const CONTRIBUTORS = [
  { rank: 1, name: "Salah Badreddine", wilaya: "Algiers", trees: 100, image: "/img/salah.jpeg" },
  { rank: 2, name: "Islem Gouicem", wilaya: "Biskra", trees: 75, image: "/img/ISLAM.jpg" },
  { rank: 3, name: "Chaabnia Enzo", wilaya: "Annaba", trees: 50, image: "/img/enzo.jpeg" },
];

export const KEY_STATS = [
  { label: "Total trees planted", value: 10000, suffix: "" },
  { label: "Active projects", value: 5, suffix: "" },
  { label: "Carbon offset estimate", value: 500, suffix: " t" },
  { label: "Participation rate", value: 70, suffix: "%" },
  { label: "Land restored", value: 200, suffix: " acres" },
  { label: "Water usage reduction", value: 50000, suffix: " L" },
];

export const GOALS = [
  { label: "Trees planted", value: 10 },
  { label: "Carbon offset estimate", value: 30 },
  { label: "Land restored", value: 15 },
  { label: "Water usage reduction", value: 5 },
];

export type TreeSpeciesKey = "oak" | "pine" | "acacia" | "almond" | "cedar" | "palm";

export interface Specimen {
  key: TreeSpeciesKey; name: string; latin: string; family: string; description: string; distribution: string; uses: string;
  soil: string; moisture: string; locations: string;
}

export const SPECIMENS: Specimen[] = [
  { key: "cedar", name: "Atlas cedar", latin: "Cedrus atlantica", family: "Pinaceae", description: "A tall evergreen conifer with tiered, flat boughs. Algeria's Aurès and Blida Atlas hold some of its last wild stands.", distribution: "Native to the Atlas mountains of Algeria and Morocco.", uses: "Fragrant, durable timber; slope protection and mountain restoration.", soil: "Deep, well-drained limestone soils.", moisture: "Moderate, and tolerant of snow and summer drought once established.", locations: "Mountain forests above about 1,300 m." },
  { key: "pine", name: "Aleppo pine", latin: "Pinus halepensis", family: "Pinaceae", description: "A hardy, irregular pine with a leaning trunk and an open crown, widely planted along Algeria's Green Dam.", distribution: "Native around the Mediterranean basin.", uses: "Windbreaks, erosion control, resin and timber.", soil: "Poor, stony and calcareous soils.", moisture: "Low. Very drought tolerant.", locations: "Hillsides, steppe margins and coastal mountains." },
  { key: "oak", name: "Holm oak", latin: "Quercus ilex", family: "Fagaceae", description: "A long-lived evergreen oak with a dense rounded crown and acorns that feed wildlife.", distribution: "Native to the western and central Mediterranean.", uses: "Hardwood, charcoal, acorns for fodder, deep shade.", soil: "Adaptable, from limestone to sandy loam.", moisture: "Low to moderate.", locations: "Tell Atlas woodland and foothills." },
  { key: "acacia", name: "Umbrella acacia", latin: "Vachellia tortilis", family: "Fabaceae", description: "A flat-topped thorn tree of arid land. It fixes nitrogen and gives shade where almost nothing else grows.", distribution: "Across arid Africa and the Middle East, including the Sahara.", uses: "Fodder, shade, soil improvement and dune stabilisation.", soil: "Sandy and rocky desert soils.", moisture: "Very low. Deep roots reach groundwater.", locations: "Wadis and desert plains." },
  { key: "almond", name: "Almond", latin: "Prunus dulcis", family: "Rosaceae", description: "A small deciduous tree that flowers in late winter, before its leaves appear, in a cloud of pale pink.", distribution: "Cultivated all around the Mediterranean.", uses: "Nuts, nectar for early bees, and income for farmers.", soil: "Well-drained, light soils.", moisture: "Low to moderate.", locations: "Orchards and terraces of the Tell and high plains." },
  { key: "palm", name: "Date palm", latin: "Phoenix dactylifera", family: "Arecaceae", description: "The tree of the oasis. It shades the gardens below it and anchors entire Saharan communities.", distribution: "Oases across North Africa and the Middle East.", uses: "Dates, fronds for building and fencing, windbreaks.", soil: "Sandy, and tolerant of salt.", moisture: "High at the roots, dry air above.", locations: "Saharan oases such as Oued Souf and Biskra." },
];

/** Old site's sample AI result, kept as the preview of what is coming */
export const SAMPLE_RESULT = {
  name: "Quercus robur",
  common: "English oak",
  accuracy: 85,
  family: "Fagaceae",
  description: "A large deciduous tree that can reach 40 metres, with a broad rounded crown and deeply lobed leaves, valued for its strength, longevity and ecological importance.",
  soil: "Thrives in well-drained sandy loam soil.",
  moisture: "Prefers moderate moisture and does not tolerate waterlogged soil.",
  locations: "Commonly found in deciduous forests and open woodlands.",
  distribution: "Native to Europe and parts of Asia.",
  uses: "Wood is valued for furniture and flooring; acorns provide food for wildlife.",
  images: { tree: "/img/photos/oak-tree.jpg", leaf: "/img/photos/oak-leaf.jpg", flower: "/img/photos/oak-flower.jpg" },
  similar: [{ name: "Acacia", image: "/img/photos/acacia-tree.jpg" }, { name: "Acacia leaf", image: "/img/photos/scan-leaf.jpg" }, { name: "Acacia flower", image: "/img/photos/acacia-flower.jpg" }],
};

export interface Recommendable { name: string; latin: string; regions: string[]; soils: string[]; water: string[]; purposes: string[]; why: string; visual: TreeSpeciesKey }

export const RECOMMENDABLE: Recommendable[] = [
  { name: "Atlas cedar", latin: "Cedrus atlantica", regions: ["mountain"], soils: ["rocky", "loam"], water: ["seasonal", "regular"], purposes: ["restoration", "shade"], why: "Native to Algeria's high Atlas, and suited to cold winters and steep ground.", visual: "cedar" },
  { name: "Aleppo pine", latin: "Pinus halepensis", regions: ["tell", "steppe", "mountain", "coast"], soils: ["rocky", "sandy", "loam"], water: ["rare", "seasonal"], purposes: ["windbreak", "restoration"], why: "Tolerates poor stony soil and long drought better than almost any other conifer.", visual: "pine" },
  { name: "Holm oak", latin: "Quercus ilex", regions: ["tell", "mountain", "coast"], soils: ["loam", "rocky", "clay"], water: ["seasonal"], purposes: ["shade", "restoration"], why: "Long-lived, evergreen, and it supports a rich community of native wildlife.", visual: "oak" },
  { name: "Cork oak", latin: "Quercus suber", regions: ["coast", "tell"], soils: ["sandy", "loam"], water: ["seasonal", "regular"], purposes: ["restoration", "fruit"], why: "Thrives in the humid northeast, resists fire, and gives a renewable harvest of cork.", visual: "oak" },
  { name: "Carob", latin: "Ceratonia siliqua", regions: ["coast", "tell"], soils: ["rocky", "loam", "clay"], water: ["rare", "seasonal"], purposes: ["fruit", "shade"], why: "Drought-hardy once rooted, with edible pods and a broad, dense shade.", visual: "oak" },
  { name: "Olive", latin: "Olea europaea", regions: ["coast", "tell", "steppe"], soils: ["rocky", "loam", "clay"], water: ["rare", "seasonal"], purposes: ["fruit", "restoration"], why: "A long-lived Mediterranean tree that holds terraces and produces for generations.", visual: "almond" },
  { name: "Almond", latin: "Prunus dulcis", regions: ["tell", "steppe"], soils: ["loam", "sandy", "rocky"], water: ["rare", "seasonal"], purposes: ["fruit", "ornamental"], why: "Late-winter blossom feeds early bees, and the nuts bring income from dry land.", visual: "almond" },
  { name: "Umbrella acacia", latin: "Vachellia tortilis", regions: ["sahara", "steppe"], soils: ["sandy", "rocky"], water: ["rare"], purposes: ["shade", "restoration", "windbreak"], why: "Deep roots and nitrogen fixation make it a pioneer on the harshest land.", visual: "acacia" },
  { name: "Tamarisk", latin: "Tamarix aphylla", regions: ["sahara", "steppe"], soils: ["sandy", "clay"], water: ["rare", "seasonal"], purposes: ["windbreak", "restoration"], why: "Tolerates salt and shifting sand, which makes it a strong windbreak around oases.", visual: "acacia" },
  { name: "Date palm", latin: "Phoenix dactylifera", regions: ["sahara"], soils: ["sandy", "clay"], water: ["regular"], purposes: ["fruit", "shade", "windbreak"], why: "The heart of the oasis, shading the garden under it where groundwater is reachable.", visual: "palm" },
  { name: "Jacaranda", latin: "Jacaranda mimosifolia", regions: ["coast", "tell"], soils: ["loam", "sandy"], water: ["regular"], purposes: ["ornamental", "shade"], why: "A familiar sight on city boulevards, with a dramatic violet bloom.", visual: "almond" },
];

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About us" },
  { href: "/campaigns", label: "Campaigns" },
];

export const SERVICES = [
  { href: "/irrigation", label: "Irrigation", hint: "Water by the forecast" },
  { href: "/identify", label: "Tree Identification", hint: "AI coming soon" },
  { href: "/impact", label: "Impact Tracking", hint: "Measure what grew" },
  { href: "/recommend", label: "Tree Matchmaker", hint: "Find your species" },
];

export const CONTACT = {
  email: "algreenia@gmail.com",
  phone: "+213 550 361 356",
  address: "Sidi Abdellah Campus, Algiers, Algeria",
};
