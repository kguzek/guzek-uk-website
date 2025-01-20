import Image from "next/image";
import Link from "next/link";

function Logo({ size = 80 }) {
  return (
    <Link href="/" className="max-w-16 sm:max-w-none">
      <Image
        src="/logo128.png"
        width={size}
        height={size}
        alt="Guzek UK Logo"
      />
    </Link>
  );
}

export default Logo;