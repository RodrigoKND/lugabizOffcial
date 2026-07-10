import { GoogleIcon } from '@icons/index';
import { Button } from '@presentation/components/ui/button';
import type { SocialLoginProps } from '@domain/entities/props/AuthProps';

export default function SocialLogin({ onGoogleLogin }: SocialLoginProps) {
  return (
    <>
      <Button type="button" variant="secondary" size="xl" fullWidth onClick={onGoogleLogin} className="mb-5">
        <GoogleIcon size={20} />
        <span className="text-white/75 font-medium">Continuar con Google</span>
      </Button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/8" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-[#150d2e] text-white/25 text-xs">o con email</span>
        </div>
      </div>
    </>
  );
}
