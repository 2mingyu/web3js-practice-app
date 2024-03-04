import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SetRPCURL from './SetRPCURL';
import GetBlockNumber from './GetBlockNumber';

import './MyPage.css';

const MyPage: React.FC = () => {
  const [RPC_URL, setRPC_URL] = useState('');
  const [web3, setWeb3] = useState<Web3 | null>(null);
  useEffect(() => {
    if (RPC_URL) { setWeb3(new Web3(RPC_URL)); }
  }, [RPC_URL]);

  return (
    <div className='MyPage'>
      <SetRPCURL setRPCURL={setRPC_URL} />
      <GetBlockNumber web3={web3} />
    </div>
  );
};

export default MyPage;
