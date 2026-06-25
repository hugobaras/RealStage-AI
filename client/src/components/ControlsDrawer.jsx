export default function ControlsDrawer({ children }) {
  return (
    <div className="hidden h-full w-[280px] shrink-0 flex-col border-r border-line/80 bg-panel/95 lg:flex">
      {children}
    </div>
  );
}
