"use client"

import { useManualCompilation } from '@/components/compilation-detector'
import { useLoading } from '@/hooks/use-loading'

export default function TestCompilationPage() {
  const { triggerCompilation, stopCompilation } = useManualCompilation()
  const { isCompiling, compilationStep } = useLoading()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🚀 Compilation Loading Test
          </h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Current Status
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Compiling:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    isCompiling ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isCompiling ? 'Yes' : 'No'}
                  </span>
                </div>
                {compilationStep && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Current Step:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {compilationStep}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => triggerCompilation()}
                disabled={isCompiling}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                🚀 Trigger Compilation
              </button>
              
              <button
                onClick={() => triggerCompilation('Custom step: Building components...')}
                disabled={isCompiling}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                🎯 Custom Compilation
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                💡 How It Works
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Click "Trigger Compilation" to simulate a compilation process</li>
                <li>• The app will show a full-screen compilation loading overlay</li>
                <li>• You'll see different compilation steps with progress indicators</li>
                <li>• In real development, this detects actual Next.js compilation</li>
                <li>• The loading automatically stops when compilation completes</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🔧 Technical Details
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  This system uses React Context to manage compilation state across the entire app.
                  When compilation is detected (either manually or automatically), it shows a
                  beautiful loading overlay with:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Compilation step indicators</li>
                  <li>Progress bars and animations</li>
                  <li>Context-aware styling (admin, dashboard, default)</li>
                  <li>Automatic cleanup and state management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
