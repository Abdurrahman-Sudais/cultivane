export const site = {
  name: 'Cultivane',
  domain: 'cultivane.site',
  url: 'https://cultivane.site',
  tagline: 'Understand every batch in context.',
  founder: 'Mariam Suleiman',
  email: 'mariam@cultivate.site',
  description:
    'Cultivane helps fermentation teams compare batches at corresponding process phases, identify unusual measurement patterns, review missing data, and organise process investigations.',
} as const;

export const marketingNav = [
  { to: '/product', label: 'Product' },
  { to: '/batch-monitoring', label: 'Batch Monitoring' },
  { to: '/process-analytics', label: 'Process Analytics' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
] as const;

/** Verified Unsplash photography (industrial, laboratory and process settings). */
const unsplash = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const photos = {
  facility: { src: unsplash('photo-1516937941344-00b4e0337589'), alt: 'Industrial production facility with process towers' },
  processEquipment: { src: unsplash('photo-1581092335397-9583eb92d232'), alt: 'Engineer adjusting stainless process equipment' },
  processLab: { src: unsplash('photo-1581091226825-a6a2a5aee158'), alt: 'Process engineer working at a laptop beside instrumented equipment' },
  lab: { src: unsplash('photo-1579154204601-01588f351e67'), alt: 'Long laboratory bench with analytical instruments' },
  labBench: { src: unsplash('photo-1581093577421-f561a654a353'), alt: 'Scientist at a laboratory bench with tubing and glassware' },
  controlRoom: { src: unsplash('photo-1581092795360-fd1ca04f0952'), alt: 'Operators monitoring process data in a control room' },
  sampling: { src: unsplash('photo-1614935151651-0bea6508db6b'), alt: 'Scientist pipetting samples into tubes' },
  plate: { src: unsplash('photo-1532187863486-abf9dbad1b69'), alt: 'Pipette dispensing into a multi-well plate' },
  microscope: { src: unsplash('photo-1582719471384-894fbb16e074'), alt: 'Scientist using a microscope in a laboratory' },
} as const;
