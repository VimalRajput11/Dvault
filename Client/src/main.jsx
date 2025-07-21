import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

import { WagmiConfig } from 'wagmi'; // ✅ correct for wagmi v1+
import { Web3Modal } from '@web3modal/react';
import { wagmiConfig, ethereumClient, projectId } from './contexts/walletConfig';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" reverseOrder={false} />
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </BrowserRouter>
    </WagmiConfig>
  </StrictMode>
);
