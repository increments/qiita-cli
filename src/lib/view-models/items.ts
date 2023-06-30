export type ItemViewModel = {
  id: string | null;
  items_show_path: string;
  secret: boolean;
  title: string;
  updated_at: string;
  modified: boolean;
};

export type ItemsIndexViewModel = {
  private: ItemViewModel[];
  draft: ItemViewModel[];
  public: ItemViewModel[];
};
