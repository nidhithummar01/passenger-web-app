type TuxedoLogoProps = {
  className?: string;
};

export function TuxedoLogo({ className = 'h-9 w-auto' }: TuxedoLogoProps) {
  const src = `${import.meta.env.BASE_URL}tuxedo-logo-white.png`;

  return (
    <img
      src={src}
      alt="Tuxedo"
      className={className}
      draggable={false}
    />
  );
}
