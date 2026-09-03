export type SlidesShowViewModel = {
  title: string;
  pages: { html: string; speaker_note: string[] }[];
  css: string;
  error_messages: string[];
  slides_show_path: string;
  slide_path: string;
  published: boolean;
  theme: string | null;
};

export type SlideViewModel = {
  id: string | null;
  name: string;
  title: string;
  updated_at: string | null;
  slides_show_path: string;
  published: boolean;
};

export type SlidesIndexViewModel = {
  draft: SlideViewModel[];
  published: SlideViewModel[];
};
