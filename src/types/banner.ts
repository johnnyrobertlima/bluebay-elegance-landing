
export interface Banner {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  youtube_url: string | null;
  button_text: string | null;
  button_link: string | null;
  is_active: boolean;
  page_location: string;
  duration: number;
  created_at: string;
}
