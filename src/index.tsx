import { createRoot } from 'react-dom/client';
import {
  AdaptivityProvider,
  ConfigProvider,
} from '@vkontakte/vkui';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <ConfigProvider>
    <AdaptivityProvider>
      <App />
    </AdaptivityProvider>
  </ConfigProvider>,
);