import Image from "next/image";
import Link from "next/link";

import logo128 from "@/../public/logo128.png";

export function Logo({ size = 80 }) {
  return (
    <Link href="/" className="max-w-16 min-w-5 sm:max-w-none">
      <Image src={logo128} width={size} height={size} alt="Guzek UK Logo" priority />
    </Link>
  );
}
