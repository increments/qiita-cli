import classNames from "classnames";
import { Fragment } from "react";
import { MaterialSymbol } from "../MaterialSymbol";

export const SlideViewerDashboardNavigation = ({
  currentPage,
  totalPage,
  onPrevious,
  onNext,
}: {
  currentPage: number;
  totalPage: number;
  onPrevious: () => void;
  onNext: () => void;
}) => {
  const disablePrevious = currentPage === 1;
  const disableNext = currentPage === totalPage;

  return (
    <Fragment>
      <button
        aria-label="前のページ"
        className={classNames(
          "slideMode-Dashboard_button",
          "slideMode-Dashboard_button--prev",
          {
            "slideMode-Dashboard_button--clickable": !disablePrevious,
          },
        )}
        disabled={disablePrevious}
        onClick={() => onPrevious()}
      >
        <MaterialSymbol fill={true} size={20}>
          arrow_back
        </MaterialSymbol>
      </button>
      <button
        aria-label="次のページ"
        className={classNames(
          "slideMode-Dashboard_button",
          "slideMode-Dashboard_button--next",
          {
            "slideMode-Dashboard_button--clickable": !disableNext,
          },
        )}
        disabled={disableNext}
        onClick={() => onNext()}
      >
        <MaterialSymbol fill={true} size={20}>
          arrow_forward
        </MaterialSymbol>
      </button>
    </Fragment>
  );
};
