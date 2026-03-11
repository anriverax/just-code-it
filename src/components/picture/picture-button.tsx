interface PictureButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: "small" | "medium" | "large";
  /**
   * Button contents
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const PictureButton = ({
  primary = true,
  backgroundColor,
  size = "medium",
  onClick,
  label
}: PictureButtonProps): React.JSX.Element => {
  const mode = primary ? "picture-button--primary" : "picture-button--secondary";

  return (
    <button
      type="button"
      className={["picture-button", `picture-button--${size}`, mode].join(" ")}
      style={backgroundColor ? { backgroundColor } : {}}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default PictureButton;
