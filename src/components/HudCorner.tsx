interface HudCornerProps {
  position: 'tl' | 'tr' | 'bl' | 'br';
  size?: number;
}

const HudCorner = ({ position, size = 20 }: HudCornerProps) => {
  const borders: Record<string, string> = {
    tl: 'border-t-2 border-l-2 top-0 left-0',
    tr: 'border-t-2 border-r-2 top-0 right-0',
    bl: 'border-b-2 border-l-2 bottom-0 left-0',
    br: 'border-b-2 border-r-2 bottom-0 right-0',
  };

  return (
    <div
      className={`absolute ${borders[position]} border-hud-accent`}
      style={{ width: size, height: size }}
    />
  );
};

export default HudCorner;
