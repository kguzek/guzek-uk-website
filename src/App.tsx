import PageTemplate, { PageSkeleton } from "./pages/page-template";
import ErrorPage from "./components/error-page";
import Profile from "./pages/profile";
import "./styles/styles.css";
import "./styles/forms.css";
import LogIn from "./pages/login";
import SignUp from "./pages/signup";
import { ErrorCode } from "./lib/models";
import ContentManager from "./pages/admin/content-manager";
import LiveSeriesLayout from "./pages/liveseries/layout";
import MostPopular from "./pages/liveseries/most-popular/page";
import Home from "./pages/liveseries/page";
import Search from "./pages/liveseries/search";
import TvShow from "./pages/liveseries/tv-show";
import Watch from "./pages/liveseries/watch";
import AdminBase from "./pages/admin/layout";
import Users from "./pages/admin/users";
import Logs from "./pages/admin/logs";
import UserPage from "./pages/admin/users/[uuid]/page";

export default function App() {
  return (
    <Routes>
      {menuItems ? (
        menuItems
          .filter((item) => item.shouldFetch)
          .map((item, idx) => (
            <Route
              key={idx}
              path={item.url}
              element={<PageTemplate pageData={item} />}
            />
          ))
      ) : (
        <Route
          index
          element={
            <div className="text">
              <PageSkeleton />
            </div>
          }
        />
      )}
      <Route
        path="admin"
        element={
          currentUser === undefined ? (
            <div className="flex-column">
              <h3>Validating permissions...</h3>
            </div>
          ) : currentUser?.admin ? (
            <AdminBase />
          ) : (
            <ErrorPage errorCode={ErrorCode.Forbidden} />
          )
        }
      >
        <Route path="content-manager" element={<ContentManager />} />
        <Route path="users">
          <Route index element={<Users />} />
          <Route path=":uuid" element={<UserPage />} />
        </Route>
        <Route path="logs" element={<Logs />} />
      </Route>
      <Route path="liveseries" element={<LiveSeriesLayout />}>
        <Route index element={<Home />} />
        <Route path="most-popular" element={<MostPopular />} />
        <Route path="search" element={<Search />} />
        <Route path="tv-show/:permalink" element={<TvShow />} />
        <Route path="watch/:showName/:season/:episode" element={<Watch />} />
      </Route>
      <Route path="*" element={} />
    </Routes>
  );
}
