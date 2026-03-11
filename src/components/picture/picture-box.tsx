import Image from "next/image";

type PictureBoxProps = {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export const PictureBox = ({ src, alt, width = 300, height = 200 }: PictureBoxProps): React.JSX.Element => (
  <div style={{ position: "relative", width, height }}>
    {src ? (
      <Image fill alt={alt ?? ""} sizes={`${width}px`} src={src} style={{ objectFit: "cover" }} />
    ) : (
      <span>No image provided</span>
    )}
  </div>
);
