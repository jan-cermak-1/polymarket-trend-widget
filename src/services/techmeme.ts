import axios from 'axios';

const TECHMEME_API_URL = '/api/techmeme';

export interface TechmemeStory {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

export const getTechmemeStories = async (): Promise<TechmemeStory[]> => {
  try {
    const response = await axios.get(TECHMEME_API_URL, {
      timeout: 10000,
    });

    return response.data.stories || [];
  } catch (error) {
    console.error('Error fetching Techmeme stories:', error);
    return [];
  }
};

