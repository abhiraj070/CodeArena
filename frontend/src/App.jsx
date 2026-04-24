import { Navigate, Routes, Route } from "react-router-dom";
import IndexPage from "./routes/index.jsx";
import PeoplePage from "./routes/people.jsx";
import AuthPage from "./routes/auth.jsx";
import ProfilePage from "./routes/profile.jsx";
import QuestionPage from "./routes/question.$id.jsx";
import NotFoundPage from "./routes/NotFound.jsx";
import { useUser } from "./context/user.context.jsx";

export default function App() {
  const { user } = useUser();
  const isAuthenticated = Boolean(user);

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <IndexPage /> : <Navigate to="/auth" replace />}
      />
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/question/:id" element={<QuestionPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
