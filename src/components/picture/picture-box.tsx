type PictureBoxProps = {
  src?: string;
  alt?: string;
};

export const PictureBox = ({ src, alt }: PictureBoxProps) => (
  <div>{src ? <img src={src} alt={alt || ""} /> : <span>No image provided</span>}</div>
);
