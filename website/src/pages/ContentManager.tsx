import React from "react";
import { User } from "../models";
import { Translation } from "../translations";

export default function ContentManager({
  data,
  user,
}: {
  data: Translation;
  user: User | null;
}) {
  return <div>ContentManager</div>;
}
