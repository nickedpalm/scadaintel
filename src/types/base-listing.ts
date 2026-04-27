// Core fields present on every listing regardless of vertical.
// Niche-specific additions are generated into src/types/listing.ts
// by scripts/gen_ts_types.py based on configs/<vertical>.yaml.

export interface BaseListing {
  slug: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
  description?: string;
  image?: string;
  logo?: string;
  review_count: number;
  rating?: number;
  scraped_at?: string;
  claimed?: boolean;
  featured?: boolean;
  sponsored?: boolean;
}
