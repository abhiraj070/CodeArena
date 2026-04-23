import { Navigate, Routes, Route } from "react-router-dom";
import IndexPage from "./routes/index.jsx";
import PeoplePage from "./routes/people.jsx";
import AuthPage from "./routes/auth.jsx";
import ProfilePage from "./routes/profile.jsx";
import QuestionPage from "./routes/question.$id.jsx";
import NotFoundPage from "./routes/NotFound.jsx";

export default function App() {
  let hasStoredUser = false;

  try {
    const storedUser = localStorage.getItem("codearena-auth-user");
    hasStoredUser = Boolean(storedUser && storedUser !== "null");
  } catch {
    hasStoredUser = false;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={hasStoredUser ? <IndexPage /> : <Navigate to="/auth" replace />}
      />
      <Route
        path="/auth"
        element={hasStoredUser ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/question/:id" element={<QuestionPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
