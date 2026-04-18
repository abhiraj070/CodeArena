import { Routes, Route } from "react-router-dom";
import IndexPage from "./routes/index.jsx";
import PeoplePage from "./routes/people.jsx";
import ProfilePage from "./routes/profile.jsx";
import QuestionPage from "./routes/question.$id.jsx";
import NotFoundPage from "./routes/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/question/:id" element={<QuestionPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
