import type { ComponentProps } from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";

export function ExpandableImage({ alt, ...props }: ComponentProps<typeof Image>) {
  return (
    <Dialog>
      <DialogTrigger>
        <Image alt={alt} {...props} />
      </DialogTrigger>
      <DialogContent className="max-w-fit!">
        <DialogHeader>
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <DialogDescription>
            <Image
              alt={alt}
              {...props}
              className="h-auto max-h-[80vh] w-auto max-w-[80vw]"
            />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
