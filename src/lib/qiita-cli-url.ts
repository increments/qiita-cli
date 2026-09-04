type ItemsShowQueryKeys = "basename";
type ItemsShowQueryParams = Record<ItemsShowQueryKeys, string>;

export const itemsIndexPath = () => {
  return "/";
};

export const slidesShowPath = (
  slideId: string,
  params?: ItemsShowQueryParams,
): string => {
  const url: string = `/slides/${slideId}`;

  if (slideId === "show" && params) {
    const query = new URLSearchParams(params).toString();

    return `${url}?${query}`;
  } else {
    return url;
  }
};

export const apiSlidesShowPath = (
  slideId: string,
  params?: ItemsShowQueryParams,
): string => {
  const url: string = `/api/slides/${slideId}`;

  if (slideId === "show" && params) {
    const query = new URLSearchParams(params).toString();

    return `${url}?${query}`;
  } else {
    return url;
  }
};

export const itemsShowPath = (
  itemId: string,
  params?: ItemsShowQueryParams,
): string => {
  const url: string = `/items/${itemId}`;

  if (itemId === "show" && params) {
    const query = new URLSearchParams(params).toString();

    return `${url}?${query}`;
  } else {
    return url;
  }
};

export const apiItemsShowPath = (
  itemId: string,
  params?: ItemsShowQueryParams,
): string => {
  const url: string = `/api/items/${itemId}`;

  if (itemId === "show" && params) {
    const query = new URLSearchParams(params).toString();

    return `${url}?${query}`;
  } else {
    return url;
  }
};

export const apiItemsUpdatePath = (itemId: string): string => {
  return `/api/items/${itemId === "show" ? "post" : itemId}`;
};

export const apiReadmeShowPath = () => {
  return "/api/readme";
};
