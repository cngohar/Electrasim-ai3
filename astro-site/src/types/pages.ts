export type ContentCard = {
  icon: string;
  title: string;
  body: string;
};

export type LandingPage = {
  seo_title: string;
  seo_description: string;
  hero_badge: string;
  hero_heading: string;
  hero_heading_highlight: string;
  hero_description: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  hero_trust_items: string[];
  features_label: string;
  features_heading: string;
  features_description: string;
  features: ContentCard[];
  how_label: string;
  how_heading: string;
  how_description: string;
  steps: Pick<ContentCard, 'title' | 'body'>[];
  usecases_label: string;
  usecases_heading: string;
  usecases_description: string;
  use_cases: ContentCard[];
  blog_label: string;
  blog_heading: string;
  blog_description: string;
  cta_heading: string;
  cta_description: string;
  cta_button: string;
};

export type GuideCircuit = {
  id: string;
  step: string;
  title: string;
  level: string;
  description: string;
  components: string[];
  diagram: string;
  steps: string[];
  insight: string;
};

export type GuideFeature = ContentCard;

export type GuidedTemplate = {
  title: string;
  level: string;
  body: string;
};
