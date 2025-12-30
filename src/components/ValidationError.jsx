import { AlertCircle } from 'lucide-react';

const ValidationError = ({ error }) => {
  if (!error) return null;

  return (
    <div className="flex items-start gap-2 mt-1">
      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );
};

export default ValidationError;
