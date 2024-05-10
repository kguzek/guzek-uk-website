import React, { useContext } from "react";
import { Link, useOutletContext } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import {
  ModalContext,
  TranslationContext,
  useFetchContext,
} from "../../misc/context";
import { User } from "../../misc/models";
import { getErrorMessage } from "../../misc/util";
import { AdminContext } from "./Base";

export default function Users() {
  const { users, setUsers } = useOutletContext<AdminContext>();
  const { setModalChoice, setModalError, setModalInfo } =
    useContext(ModalContext);
  const { fetchFromAPI } = useFetchContext();
  const data = useContext(TranslationContext);

  if (!users) return <LoadingScreen />;

  async function confirmDelete(user: User) {
    const primary = await setModalChoice(data.admin.confirmDelete);
    if (!primary) return;
    await deleteUser(user);
  }

  async function deleteUser(user: User) {
    try {
      const res = await fetchFromAPI(`users/${user.uuid}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setModalInfo(`User '${user.username}' has been deleted.`);
        setUsers(
          (old) => old?.filter((some) => some.uuid !== user.uuid) ?? null
        );
      } else {
        const json = await res.json();
        setModalError(getErrorMessage(res, json, data));
      }
    } catch (error) {
      console.error(error);
      setModalError(data.networkError);
    }
  }

  return (
    <div className="users flex-column gap-10">
      {users.map((user, idx) => (
        <div key={idx} className="clickable user-container no-overflow">
          <Link to={user.uuid} className="user flex gap-15">
            <i className={`fa-solid fa-user ${user.admin ? "admin" : ""}`}></i>
            <div>
              <div className="flex">
                <i>{user.username}</i>
              </div>
              <div className="serif regular">{user.email}</div>
            </div>
            <i className="fa-solid fa-gear"></i>
          </Link>
          <div className="delete" onClick={() => confirmDelete(user)}>
            <i className="fa-solid fa-trash"></i>
          </div>
        </div>
      ))}
    </div>
  );
}

