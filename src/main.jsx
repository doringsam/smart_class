import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 리액트 앱의 진입점(Entry Point) 파일입니다.
// HTML의 #root 요소에 App 컴포넌트를 마운트합니다.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
