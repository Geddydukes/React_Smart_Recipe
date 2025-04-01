import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { aiService } from './ai';

interface SocialRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  cookTime?: number;
  servings?: number;
  source: 'tiktok' | 'instagram';
  sourceUrl: string;
}

export const socialService = {
  async importFromTikTok(url: string): Promise<SocialRecipe> {
    try {
      // Extract video ID from URL
      const videoId = this.extractTikTokVideoId(url);
      if (!videoId) {
        throw new Error('Invalid TikTok URL');
      }

      // TODO: Implement TikTok API integration
      // For now, we'll use AI to analyze the video description
      const videoData = await this.fetchTikTokVideoData(videoId);
      return this.parseTikTokData(videoData);
    } catch (error) {
      console.error('Error importing from TikTok:', error);
      throw new Error('Failed to import recipe from TikTok');
    }
  },

  async importFromInstagram(url: string): Promise<SocialRecipe> {
    try {
      // Extract post ID from URL
      const postId = this.extractInstagramPostId(url);
      if (!postId) {
        throw new Error('Invalid Instagram URL');
      }

      // TODO: Implement Instagram API integration
      // For now, we'll use AI to analyze the post content
      const postData = await this.fetchInstagramPostData(postId);
      return this.parseInstagramData(postData);
    } catch (error) {
      console.error('Error importing from Instagram:', error);
      throw new Error('Failed to import recipe from Instagram');
    }
  },

  extractTikTokVideoId(url: string): string | null {
    const match = url.match(/video\/(\d+)/);
    return match ? match[1] : null;
  },

  extractInstagramPostId(url: string): string | null {
    const match = url.match(/p\/([^/]+)/);
    return match ? match[1] : null;
  },

  async fetchTikTokVideoData(videoId: string): Promise<any> {
    // TODO: Implement TikTok API call
    // This is a placeholder that will be replaced with actual API integration
    return {
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
    };
  },

  async fetchInstagramPostData(postId: string): Promise<any> {
    // TODO: Implement Instagram API call
    // This is a placeholder that will be replaced with actual API integration
    return {
      caption: '',
      mediaUrl: '',
      timestamp: '',
    };
  },

  async parseTikTokData(data: any): Promise<SocialRecipe> {
    // Use AI to analyze the video description and extract recipe information
    const recipeData = await aiService.parseRecipeFromText(data.description);
    return {
      ...recipeData,
      source: 'tiktok',
      sourceUrl: data.videoUrl,
    };
  },

  async parseInstagramData(data: any): Promise<SocialRecipe> {
    // Use AI to analyze the post caption and extract recipe information
    const recipeData = await aiService.parseRecipeFromText(data.caption);
    return {
      ...recipeData,
      source: 'instagram',
      sourceUrl: data.mediaUrl,
    };
  },

  async openSocialApp(url: string): Promise<boolean> {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        throw new Error('Cannot open URL');
      }
      await Linking.openURL(url);
      return true;
    } catch (error) {
      console.error('Error opening social app:', error);
      return false;
    }
  },

  async importRecipe(url: string): Promise<SocialRecipe> {
    if (url.includes('tiktok.com')) {
      return this.importFromTikTok(url);
    } else if (url.includes('instagram.com')) {
      return this.importFromInstagram(url);
    } else {
      throw new Error('Unsupported social media platform');
    }
  },

  async openApp(platform: 'tiktok' | 'instagram'): Promise<void> {
    const urls = {
      tiktok: 'tiktok://',
      instagram: 'instagram://',
    };

    const url = urls[platform];
    if (!url) {
      throw new Error('Unsupported platform');
    }

    await this.openSocialApp(url);
  },
};
