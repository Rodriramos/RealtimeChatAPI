import React from 'react';
import ReactDOM from 'react-dom/client';

import {
    createBrowserRouter,
    RouterProvider
} from 'react-router-dom';

import App from './App.jsx';
import LoginPage from './pages/login-page.jsx';
import ChatPage from './pages/chat-page.jsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <div>Page Not Found</div>,
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

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);