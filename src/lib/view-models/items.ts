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

export type ItemsShowViewModel = {
  error_messages: string[];
  item_path: string;
  modified: boolean;
  organization_url_name: string | null;
  published: boolean;
  qiita_item_url: string | null;
  rendered_body: string;
  secret: boolean;
  tags: string[];
  title: string;
};
