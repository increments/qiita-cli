import { useState } from "react";
import { MaterialSymbol } from "../MaterialSymbol";
import { getMagnitudeFromRange } from "./get-magnitude-from-range";
import { SlideViewerDashboardNavigation } from "./SlideViewerDashboardNavigation";
import { SlideViewerDashboardQiitaLogo } from "./SlideViewerDashboardQiitaLogo";
import { SlideViewerDashboardTooltip } from "./SlideViewerDashboardTooltip";

export const SlideViewerDashboard = ({
  currentPage,
  totalPage,
  isFullScreen,
  onPrevious,
  onNext,
  onSwitchFullScreen,
  onSetPage,
}: {
  currentPage: number;
  totalPage: number;
  isFullScreen: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSwitchFullScreen: () => void;
  onSetPage: (page: number) => void;
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [destinationPage, setDestinationPage] = useState(currentPage);
  const [tooltipLeftDistance, setTooltipLeftDistance] = useState(0);

  return (
    <div className="slideMode-Dashboard">
      {isTooltipVisible && (
        <SlideViewerDashboardTooltip leftDistance={tooltipLeftDistance}>
          {destinationPage}/{totalPage}
        </SlideViewerDashboardTooltip>
      )}

      <SlideViewerDashboardNavigation
        currentPage={currentPage}
        totalPage={totalPage}
        onPrevious={onPrevious}
        onNext={onNext}
      />

      <span className="slideMode-Dashboard_pageCount">
        {currentPage} / {totalPage}
      </span>

      <div
        className="slideMode-Dashboard_progress"
        onMouseMove={(event) => {
          setIsTooltipVisible(true);
          setTooltipLeftDistance(
            event.clientX - event.currentTarget.getBoundingClientRect().left
          );
          setDestinationPage(
            getMagnitudeFromRange(event.currentTarget, event.clientX, totalPage)
          );
        }}
        onMouseLeave={() => {
          setIsTooltipVisible(false);
        }}
        onClick={() => {
          onSetPage(destinationPage);
        }}
      >
        <div
          className="slideMode-Dashboard_progressFill"
          style={{
            width: `${(currentPage / totalPage) * 100}%`,
          }}
        />
      </div>

      <button
        aria-label={"スライドショー"}
        className="slideMode-Dashboard_button slideMode-Dashboard_button--fullscreen slideMode-Dashboard_button--clickable"
        onClick={onSwitchFullScreen}
      >
        <MaterialSymbol fill={true} size={20}>
          {isFullScreen ? "close_fullscreen" : "live_tv"}
        </MaterialSymbol>
      </button>

      <SlideViewerDashboardQiitaLogo />
    </div>
  );
};
