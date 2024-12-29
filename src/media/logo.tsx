import Image from "next/image";
import Link from "next/link";

function Logo({ size = 80 }) {
  return (
    <Link href="/">
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
