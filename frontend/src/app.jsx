import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login-page.jsx';
import ChatPage from './pages/chat-page.jsx';
import OAuth2RedirectPage from './pages/oauth2-redirect-page.jsx';
import ProtectedRoute from './router/protected-route.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<Navigate to="/login" replace />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
        <Route path="/chat"            element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;