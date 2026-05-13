import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/auth-context.jsx';

import {
    createBrowserRouter,
    RouterProvider
} from 'react-router-dom';

import './index.css';

import App from './App.jsx';
import LoginPage from './pages/login-page.jsx';
import ChatPage from './pages/chat-page.jsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <div>404 Page Not Found</div>,
        children: [
            {
                path: 'login',
                element: <LoginPage />
            },
            {
                path: 'chat',
                element: <ChatPage />
            }
        ]
    }
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </StrictMode>
);