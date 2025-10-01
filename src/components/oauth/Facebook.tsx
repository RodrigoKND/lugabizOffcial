import React from 'react'
import { IconFacebook } from '@icons';

const Facebook: React.FC< { content: string }> = ({ content }: { content: string }) => {
    return (
        <button
            className='border-2 border-purple-500 flex justify-center hover:bg-blue-200/10 cursor-pointer gap-2 rounded-md w-full text-center py-2'>
            <IconFacebook />
            {content}
        </button>
    );
}

export default Facebook