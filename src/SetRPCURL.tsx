import React, { useRef } from 'react';

interface SetRPCURLProps {
  setRPCURL: (url: string) => void;
}

const SetRPCURL: React.FC<SetRPCURLProps> = ({ setRPCURL }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const applyCustomRPCURL = () => {
    if (inputRef.current) { setRPCURL(inputRef.current.value); }
  };

  return (
    <div>
      <h3>RPC URL</h3>
      <div>
        <input type="text" ref={inputRef} placeholder="RPC URL" style={({ width: '300px' })} />
        <button onClick={applyCustomRPCURL}>✅</button>
      </div>
      <p>
        You can obtain a public RPC URL from <a href="https://chainlist.org" target="_blank" rel="noopener noreferrer">chainlist.org</a>,<br />
        or use a private RPC URL, such as 'http://127.0.0.1:8545'.
      </p>
    </div>
  );
}

export default SetRPCURL;
