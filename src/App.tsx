import { TrendWidget } from './components/TrendWidget';
import { NewsWidget } from './components/NewsWidget';

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 gap-8 transition-colors duration-200">
      <TrendWidget />
      <NewsWidget />
    </div>
  );
}

export default App;
