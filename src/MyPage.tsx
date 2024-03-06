import React, { useState, useEffect, useRef } from 'react';
import Web3 from 'web3';

import './MyPage.css';

interface AccountBalances {
  [address: string]: string;
}

const MyPage: React.FC = () => {
  const [RPC_URL, setRPC_URL] = useState('');
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [gasPrice, setGasPrice] = useState<string>('-1');
  const [blockNumber, setBlockNumber] = useState<string>('-1');
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [accountBalances, setAccountBalances] = useState<AccountBalances>({});
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [estimatedGas, setEstimatedGas] = useState('');
  const [gasLimit, setGasLimit] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  // RPC_URL input
  const refRPCURL = useRef<HTMLInputElement>(null);
  const applyRPCURL = () => {
    if (refRPCURL.current) { setRPC_URL(refRPCURL.current.value); }
  };

  // RPC_URL 변경 시 새 web3 인스턴스 생성
  useEffect(() => {
    if (RPC_URL) { setWeb3(new Web3(RPC_URL)); }
  }, [RPC_URL]);

  // web3 인스턴스 변경 시
  useEffect(() => {
    // getBlockNumber
    const fetchBlockNumber = async () => {
      if (web3) {
        try {
          const response = await web3.eth.getBlockNumber();
          setBlockNumber(response.toString());
        }
        catch (error) {
          console.error(error);
          setBlockNumber('Error');
        }
      }
      else {
        setBlockNumber('-1');
      }
    }
    // getGasPrice
    const fetchGasPrice = async () => {
      if (web3) {
        try {
          const response = await web3.eth.getGasPrice();
          setGasPrice(response.toString());
        }
        catch (error) {
          console.error(error);
          setGasPrice('Error');
        }
      }
      else {
        setGasPrice('-1');
      }
    }
    fetchBlockNumber();
    fetchGasPrice();
  }, [web3]);

  // address input
  const refAddress = useRef<HTMLInputElement>(null);
  const applyAddress = () => {
    if (refAddress.current) { setAddress(refAddress.current.value); }
  };

  // address 변경 시 getBalance
  useEffect(() => {
    const fetchBalance = async () => {
      if (web3 && address) {
        try {
          const response = await web3.eth.getBalance(address);
          setBalance(response.toString());
        }
        catch (error) {
          console.error(error);
          setBalance('Error');
        }
      }
      else {
        setBalance('-1');
      }
    }
    fetchBalance();
  }, [web3, address]);

  // addAccountByPrivateKey
  const refPrivateKey = useRef<HTMLInputElement>(null);
  const addAccountByPrivateKey = () => {
    if (web3 && refPrivateKey.current && refPrivateKey.current.value) {
      const account = web3.eth.accounts.privateKeyToAccount(refPrivateKey.current.value);
      web3.eth.accounts.wallet.add(account);
      refPrivateKey.current.value = '';
      updateBalances();
    }
  };
  
  // clearWallet
  const clearWallet = () => {
    web3?.eth.accounts.wallet.clear();
  }

  // 잔액 정보 업데이트
  const updateBalances = async () => {
    const balances: AccountBalances = {};
    if (web3) {
      for (const account of web3.eth.accounts.wallet) {
        const balance = await web3.eth.getBalance(account.address);
        balances[account.address] = web3.utils.fromWei(balance, 'ether');
      }
      setAccountBalances(balances);
    }
  };

  // onClickAccount
  const onClickAccount = (address: string): void => {
    setSender(address);
    const privateKey = web3?.eth.accounts.wallet.get(address)?.privateKey;
    setPrivateKey(privateKey ?? '');
};


  //remove Account
  const removeAccount = (address: string): void => {
    web3?.eth.accounts.wallet.remove(address);
    setAccountBalances((prevBalances: AccountBalances) => {
      const updatedBalances = { ...prevBalances };
      delete updatedBalances[address];
      return updatedBalances;
    })
  }

  // 가스 추정 함수
  const estimateGas = async () => {
    if (!web3 || !sender || !recipient || !amount) {
      console.log("Missing information for gas estimation");
      return;
    }
    const gasEstimate = await web3.eth.estimateGas({
      from: sender,
      to: recipient,
      value: web3.utils.toWei(amount, 'ether'),
    });
    setEstimatedGas(gasEstimate.toString());
  };

  // 트랜잭션 서명 및 전송 기능 구현
  const signAndSendTransaction = async () => {
    if (!web3 || !sender || !recipient || !amount) {
      console.error("Missing information for the transaction");
      return;
    }

    const tx = {
      from: sender,
      to: recipient,
      value: web3.utils.toWei(amount, 'ether'),
      gas: gasLimit,
      gasPrice: web3.utils.toWei(gasPrice, 'wei'),
    };

    // 트랜잭션 서명
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

    // 트랜잭션 전송
    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
      .on('receipt', console.log)
      .on('error', console.error);
  };

  return (
    <div className='MyPage'>
      <div className='MyContainer'>
        <h2>web3.eth</h2>
        <h3>Web3 Instance</h3>
        <input type='text' ref={refRPCURL} placeholder='RPC URL' style={({ width: '80%' })} />
        <button onClick={applyRPCURL}>✅</button>
        <p>
          You can obtain a public RPC URL from <a href="https://chainlist.org" target="_blank" rel="noopener noreferrer">chainlist.org</a>,<br />
          or use a private RPC URL, such as 'http://127.0.0.1:8545'.
        </p>
        {web3 && (
          <>
            <div className='web3-instance'>
              {JSON.stringify(web3, (key, value) => typeof value === 'bigint' ? value.toString() : value)}
            </div>
            <h3>getGasPrice</h3>
            <p>{gasPrice}</p>
            <h3>getBlockNumber</h3>
            <p>{blockNumber}</p>
            <h3>getBalance</h3>
            <input type='text' ref={refAddress} placeholder='address' style={({ width: '80%'})} />
            <button onClick={applyAddress}>✅</button>
            <p>
              {balance} Wei<br />
              {(Number(balance)/1e18).toFixed(4)} ETH
            </p>
          </>
        )}
      </div>
      <div className='MyContainer'>
        <h2>web3.eth.accounts</h2>
        {web3 && (
          <>
            <h3>wallet.add</h3>
            <input type='text' ref={refPrivateKey} placeholder='private key' style={({ width: '80%'})} />
            <button onClick={addAccountByPrivateKey}>✅</button>
            <h3>wallet.clear</h3>
            <button onClick={clearWallet}>clear wallet</button>
            <h3>wallet</h3>
            <div className='wallet'>
              <button onClick={updateBalances}>Update Balances</button>
              {Object.entries(accountBalances).map(([address, balance]) => (
                <div key={address} className='account' onClick={() => onClickAccount(address)}>
                  <div className='address'>{address}</div>
                  <div>{balance} ETH</div>
                  <button onClick={() => removeAccount(address)}>Delete</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className='MyContainer'>
      <h2>Transaction</h2>
        {web3 && (
          <>
            <p>sender: {sender}</p>
            <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient Address" />
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in Ether" />
            <button onClick={estimateGas}>Estimate Gas</button>
            <div>Estimated Gas: {estimatedGas}</div>
            <input type="text" value={gasLimit} onChange={(e) => setGasLimit(e.target.value)} placeholder="Gas Limit" />
            <button onClick={signAndSendTransaction}>Sign and Send Transaction</button>
          </>
        )}
      </div>
    </div>
  );
};

export default MyPage;
