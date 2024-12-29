import PageTemplate, { PageSkeleton } from "./pages/page-template";
import ErrorPage from "./components/error-page";
import Profile from "./pages/profile";
import "./styles/styles.css";
import "./styles/forms.css";
import LogIn from "./pages/login";
import SignUp from "./pages/signup";
import { ErrorCode } from "./lib/models";
import ContentManager from "./pages/admin/content-manager";
import LiveSeriesBase from "./pages/liveseries";
import MostPopular from "./pages/liveseries/most-popular";
import Home from "./pages/liveseries/home";
import Search from "./pages/liveseries/search";
import TvShow from "./pages/liveseries/tv-show";
import Watch from "./pages/liveseries/watch";
import AdminBase from "./pages/admin";
import Users from "./pages/admin/users";
import Logs from "./pages/admin/logs";
import UserPage from "./pages/admin/user";

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
      <Route path="profile" element={<Profile />} />
      <Route path="login" element={<LogIn />} />
      <Route path="signup" element={<SignUp />} />
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
        <Route
          path="content-manager"
          element={<ContentManager menuItems={menuItems} />}
        />
        <Route path="users">
          <Route index element={<Users />} />
          <Route path=":uuid" element={<UserPage />} />
        </Route>
        <Route path="logs" element={<Logs />} />
      </Route>
      <Route path="liveseries" element={<LiveSeriesBase />}>
        <Route index element={<Home />} />
        <Route path="most-popular" element={<MostPopular />} />
        <Route path="search" element={<Search />} />
        <Route path="tv-show/:permalink" element={<TvShow />} />
        <Route path="watch/:showName/:season/:episode" element={<Watch />} />
      </Route>
      <Route path="*" element={<ErrorPage errorCode={ErrorCode.NotFound} />} />
    </Routes>
  );
}
