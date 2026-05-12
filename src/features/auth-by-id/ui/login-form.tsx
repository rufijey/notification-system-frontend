import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUserId } from '@/entities/user/model/user.slice';
import { Button, Input } from '@/shared';

export const LoginForm = () => {
  const dispatch = useDispatch();
  const [loginId, setLoginId] = useState('');

  const handleEnter = () => {
    if (loginId.trim()) {
      dispatch(setUserId(loginId));
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-neutral-900 p-8 rounded-2xl border border-neutral-800">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Welcome</h1>
        <p className="text-neutral-400 mt-2">Enter your User ID to start channelting</p>
      </div>
      <div className="space-y-4">
        <Input
          placeholder="e.g. user_123"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          className="h-12 text-lg text-white"
          onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
        />
        <Button
          className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
          onClick={handleEnter}
        >
          Enter Channel
        </Button>
      </div>
    </div>
  );
};
