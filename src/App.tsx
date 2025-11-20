import { TrendWidget } from './components/TrendWidget';
import { NewsWidget } from './components/NewsWidget';
import { RedditWidget } from './components/RedditWidget';
import { BettingWidget } from './components/BettingWidget';

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gray-50 dark:bg-gray-950 p-4 gap-8 transition-colors duration-200 pt-8 pb-12">
      <TrendWidget />
      <NewsWidget />
      <RedditWidget />
      <BettingWidget />
    </div>
  );
}

export default App;
