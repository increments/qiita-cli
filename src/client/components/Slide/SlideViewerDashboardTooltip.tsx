import { ReactNode } from "react";

export const SlideViewerDashboardTooltip = ({
  leftDistance,
  children,
}: {
  leftDistance: number;
  children: ReactNode;
}) => {
  return (
    <div style={{ left: `${leftDistance}px` }} className="slideMode-Tooltip">
      {children}
    </div>
  );
};
