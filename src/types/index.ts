export interface Project {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  imageUrl?: string;
  images?: string[];
  sourceUrl?: string;
  liveUrl?: string | null; // Allow null for liveUrl
  categories: string[];
}
