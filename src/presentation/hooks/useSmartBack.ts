import { useNavigate } from 'react-router-dom';

export function useSmartBack(fallback = '/') {
  const navigate = useNavigate();
  return () => {
    // React Router v6 sets history.state.idx — 0 means no prior in-app entry
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };
}
