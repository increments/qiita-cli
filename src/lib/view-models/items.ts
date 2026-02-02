export type ItemViewModel = {
  id: string | null;
  items_show_path: string;
  secret: boolean;
  title: string;
  updated_at: string;
  modified: boolean;
  parent: string[];
};

export type ItemsIndexViewModel = {
  private: ItemViewModel[];
  draft: ItemViewModel[];
  public: ItemViewModel[];
};

export type ItemsShowViewModel = {
  error_messages: string[];
  is_older_than_remote: boolean;
  item_path: string;
  modified: boolean;
  organization_url_name: string | null;
  published: boolean;
  qiita_item_url: string | null;
  rendered_body: string;
  secret: boolean;
  slide: boolean;
  tags: string[];
  title: string;
};
