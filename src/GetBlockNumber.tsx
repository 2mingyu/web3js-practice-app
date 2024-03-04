import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

interface GetBlockNumberProps {
  web3: Web3 | null;
}

const LatestBlockNumber: React.FC<GetBlockNumberProps> = ({ web3 }) => {
  const [blockNumber, setBlockNumber] = useState<string | null>('-1');

  useEffect(() => {
    if (web3) {
      web3.eth.getBlockNumber()
        .then(number => setBlockNumber(number.toString()))
        .catch(error => {
          console.error(error);
          setBlockNumber('Error');
        });
    } else {
      setBlockNumber('-1');
    }
  }, [web3]);

  return (
    <div>
      <h3>web3.eth.getBlockNumber</h3>
      Latest Block Number: {blockNumber}
    </div>
  );
};

export default LatestBlockNumber;
