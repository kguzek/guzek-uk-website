"use client";

import { RefreshRouteOnSave as PayloadLivePreview } from "@payloadcms/live-preview-react";

import { PRODUCTION_URL } from "@/lib/constants";
import { useRouter } from "@/lib/hooks/router";

export function RefreshRouteOnSave() {
  const router = useRouter();

  return (
    <PayloadLivePreview refresh={() => router.refresh()} serverURL={PRODUCTION_URL} />
  );
}
