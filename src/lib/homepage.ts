export type FeatureIcon = 'Truck' | 'Shield' | 'Star' | 'Clock' | 'Heart' | 'Phone' | 'Gift' | 'Zap'

export interface FeatureItem {
  icon: FeatureIcon
  title: string
  desc: string
}

export interface GlanceTile {
  slug: string
  label: string
  title: string
}

export interface SectionFeaturesBar {
  enabled: boolean
  items: FeatureItem[]
}

export interface SectionNewArrivals {
  enabled: boolean
  headingAr: string
  headingEn: string
  count: number
}

export interface SectionAtGlance {
  enabled: boolean
  tiles: GlanceTile[]
}

export interface SectionFeatured {
  enabled: boolean
  headingAr: string
  headingEn: string
  count: number
}

export interface SectionCategoryTabs {
  enabled: boolean
  headingAr: string
  headingEn: string
}

export interface SectionBrandStory {
  enabled: boolean
  title: string
  text: string
  buttonText: string
}

export interface SectionInstagram {
  enabled: boolean
  handle: string
  url: string
  count: number
}

export interface HomepageConfig {
  phone: string
  sectionsOrder: string[]
  sections: {
    features_bar:   SectionFeaturesBar
    new_arrivals:   SectionNewArrivals
    at_glance:      SectionAtGlance
    featured:       SectionFeatured
    category_tabs:  SectionCategoryTabs
    brand_story:    SectionBrandStory
    instagram:      SectionInstagram
  }
}

export const DEFAULT_CONFIG: HomepageConfig = {
  phone: '01002001446',
  sectionsOrder: ['features_bar', 'new_arrivals', 'at_glance', 'featured', 'category_tabs', 'brand_story', 'instagram'],
  sections: {
    features_bar: {
      enabled: true,
      items: [
        { icon: 'Truck',   title: 'شحن لجميع المحافظات', desc: 'لجميع أنحاء مصر' },
        { icon: 'Shield',  title: 'الدفع عند الاستلام',  desc: 'ادفعي لما يوصلك الطلب' },
        { icon: 'Star',    title: 'ماركة مصرية أصيلة',  desc: 'Proudly Egyptian Since 2000 🇪🇬' },
        { icon: 'Clock',   title: 'استلام يومي',         desc: 'من ١١ صباحًا حتي ١٢ مساءً' },
      ],
    },
    new_arrivals: {
      enabled: true,
      headingAr: 'وصل حديثًا',
      headingEn: 'New Arrivals',
      count: 10,
    },
    at_glance: {
      enabled: true,
      tiles: [
        { slug: 'eid',    label: 'كولكشن جديد',    title: 'كولكشن العيد' },
        { slug: 'abaya',  label: 'استكشفي',        title: 'عبايات راقية' },
        { slug: 'summer', label: 'الإصدار الصيفي', title: 'كولكشن الصيف' },
      ],
    },
    featured: {
      enabled: true,
      headingAr: 'مختارة بعناية',
      headingEn: 'Featured Pieces',
      count: 10,
    },
    category_tabs: {
      enabled: true,
      headingAr: 'تسوقي حسب القسم',
      headingEn: 'Shop by Category',
    },
    brand_story: {
      enabled: true,
      title: 'Every Piece Begins With a\nFabric, a Feeling, and a Story',
      text: 'زهرة الخليج — ماركة مصرية أصيلة منذ عام ٢٠٠٠. نؤمن بأن الأناقة الحقيقية تبدأ من الداخل، ونصنع لكِ ملابس تعبر عن شخصيتك الفريدة وتناسب كل مناسبة.',
      buttonText: 'اكتشفي المجموعة',
    },
    instagram: {
      enabled: true,
      handle: '@zahretelkhaleej.c',
      url: 'https://www.instagram.com/zahretelkhaleej.c/',
      count: 6,
    },
  },
}

export function parseConfig(raw: string | undefined | null): HomepageConfig {
  if (!raw) return DEFAULT_CONFIG
  try {
    const parsed = JSON.parse(raw) as Partial<HomepageConfig>
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      sections: { ...DEFAULT_CONFIG.sections, ...(parsed.sections ?? {}) },
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export const SECTION_LABELS: Record<string, string> = {
  features_bar:  'شريط المميزات',
  new_arrivals:  'وصل حديثًا / New Arrivals',
  at_glance:     'نظرة سريعة (At A Glance)',
  featured:      'مختارة / Featured Pieces',
  category_tabs: 'تسوقي حسب القسم',
  brand_story:   'قصة العلامة التجارية',
  instagram:     'معرض انستجرام',
}
