import React from 'react'
import { IconGoogle } from '@icons';
import { useAuth } from '@/context/AuthContext';
    
const Google: React.FC<{ content: string }> = ({ content }: { content: string }) => {
    const { loginWithGoogle } = useAuth();
    
    return (
        <button
            onClick={loginWithGoogle }
            type='button'
            aria-label='Login with Google'
            className='border-2 border-purple-500 flex justify-center hover:bg-purple-200/10 cursor-pointer gap-2 rounded-md w-full text-center py-2'>
            <IconGoogle />
            {content}
        </button>
    );
}

export default Google