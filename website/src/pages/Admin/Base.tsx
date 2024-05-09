import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import { MiniNavBar } from "../../components/Navigation/NavigationBar";
import { Translation, TranslationContext } from "../../misc/translations";
import "./Admin.css";

export default function AdminBase() {
  const data = useContext<Translation>(TranslationContext);
  return (
    <div className="text">
      <MiniNavBar
        pathBase="admin"
        pages={[
          { link: "content-manager", label: data.admin.contentManager.title },
          { link: "users", label: data.admin.users.title },
          { link: "logs", label: data.admin.logs.title },
        ]}
      />
      <Outlet />
    </div>
  );
}

