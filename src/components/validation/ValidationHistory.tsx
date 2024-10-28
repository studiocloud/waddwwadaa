import { ValidationHistory } from '../../types/validation';

interface ValidationHistoryProps {
  history: ValidationHistory[];
}

export const ValidationHistoryList = ({ history }: ValidationHistoryProps) => {
  if (!history.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Validations</h3>
      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-900">{item.fileName}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : item.status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Total:</span> {item.totalEmails}
                </div>
                <div>
                  <span className="text-green-600">{item.validEmails} valid</span>
                </div>
                <div>
                  <span className="text-red-600">{item.invalidEmails} invalid</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};