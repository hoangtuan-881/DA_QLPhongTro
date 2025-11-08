
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './router'
import ToastContainer from './components/base/ToastContainer';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
          <ToastContainer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
