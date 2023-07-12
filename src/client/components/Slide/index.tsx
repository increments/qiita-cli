import { SlideViewer } from "./SlideViewer";
import { slidePages } from "./slide-pages";

export const Slide = ({
  renderedBody,
  title,
}: {
  renderedBody: string;
  title: string;
}) => {
  const pages = slidePages({
    title,
    author: {
      urlName: "",
    },
    body: renderedBody,
  });

  return <SlideViewer pages={pages} />;
};
