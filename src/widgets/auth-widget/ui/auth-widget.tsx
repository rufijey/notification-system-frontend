import { LoginForm } from '../../../features/auth/login/ui/login-form';

export const AuthWidget = () => {
  return (
    <div className="w-full max-w-md space-y-8 bg-neutral-900 p-8 rounded-2xl border border-neutral-800">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Welcome</h1>
        <p className="text-neutral-400 mt-2">Enter your User ID to start channelting</p>
      </div>
      <LoginForm />
    </div>
  );
};
