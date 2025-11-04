
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './router'
import ToastContainer from './components/base/ToastContainer';

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <div className="App">
        <AppRoutes />
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}

export default App
