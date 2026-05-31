export interface GalleryPhoto {
  id: number;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: Date;
}
