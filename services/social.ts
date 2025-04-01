import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { aiService } from './ai';
import { supabase } from '../lib/supabase';

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

interface TikTokVideoData {
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  author: {
    username: string;
    displayName: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface InstagramPostData {
  caption: string;
  mediaUrl: string;
  timestamp: string;
  author: {
    username: string;
    displayName: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export const socialService = {
  async importFromTikTok(url: string): Promise<SocialRecipe> {
    try {
      const videoId = this.extractTikTokVideoId(url);
      if (!videoId) {
        throw new Error('Invalid TikTok URL');
      }

      // Check rate limit
      const { data: rateLimit } = await supabase
        .from('api_rate_limits')
        .select('*')
        .eq('platform', 'tiktok')
        .single();

      if (rateLimit && rateLimit.requests_count >= rateLimit.max_requests) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const videoData = await this.fetchTikTokVideoData(videoId);
      if (!videoData.description) {
        throw new Error('Could not fetch video description');
      }

      // Update rate limit
      await supabase.rpc('increment_rate_limit', {
        platform: 'tiktok',
      });

      return this.parseTikTokData(videoData);
    } catch (error) {
      console.error('Error importing from TikTok:', error);
      throw new Error('Failed to import recipe from TikTok');
    }
  },

  async importFromInstagram(url: string): Promise<SocialRecipe> {
    try {
      const postId = this.extractInstagramPostId(url);
      if (!postId) {
        throw new Error('Invalid Instagram URL');
      }

      // Check rate limit
      const { data: rateLimit } = await supabase
        .from('api_rate_limits')
        .select('*')
        .eq('platform', 'instagram')
        .single();

      if (rateLimit && rateLimit.requests_count >= rateLimit.max_requests) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const postData = await this.fetchInstagramPostData(postId);
      if (!postData.caption) {
        throw new Error('Could not fetch post caption');
      }

      // Update rate limit
      await supabase.rpc('increment_rate_limit', {
        platform: 'instagram',
      });

      return this.parseInstagramData(postData);
    } catch (error) {
      console.error('Error importing from Instagram:', error);
      throw new Error('Failed to import recipe from Instagram');
    }
  },

  extractTikTokVideoId(url: string): string | null {
    const patterns = [/video\/(\d+)/, /\/v\/(\d+)/, /\/t\/(\d+)/];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  },

  extractInstagramPostId(url: string): string | null {
    const patterns = [/p\/([^/]+)/, /reel\/([^/]+)/, /tv\/([^/]+)/];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  },

  async fetchTikTokVideoData(videoId: string): Promise<TikTokVideoData> {
    try {
      // Get API key from environment
      const apiKey = process.env.EXPO_PUBLIC_TIKTOK_API_KEY;
      if (!apiKey) {
        throw new Error('TikTok API key not configured');
      }

      const response = await fetch(
        `https://open.tiktokapis.com/v2/research/video/info/?fields=desc,author,stats,cover_image_url,video_url`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            video_ids: [videoId],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.statusText}`);
      }

      const data = await response.json();
      const video = data.data.videos[0];

      return {
        description: video.desc,
        videoUrl: video.video_url,
        thumbnailUrl: video.cover_image_url,
        author: {
          username: video.author.unique_id,
          displayName: video.author.nickname,
        },
        stats: {
          likes: video.stats.digg_count,
          comments: video.stats.comment_count,
          shares: video.stats.share_count,
        },
      };
    } catch (error) {
      console.error('Error fetching TikTok video:', error);
      throw new Error('Failed to fetch TikTok video data');
    }
  },

  async fetchInstagramPostData(postId: string): Promise<InstagramPostData> {
    try {
      // Get API key from environment
      const apiKey = process.env.EXPO_PUBLIC_INSTAGRAM_API_KEY;
      if (!apiKey) {
        throw new Error('Instagram API key not configured');
      }

      const response = await fetch(
        `https://graph.instagram.com/v12.0/${postId}?fields=caption,media_url,timestamp,username,like_count,comments_count&access_token=${apiKey}`,
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        caption: data.caption,
        mediaUrl: data.media_url,
        timestamp: data.timestamp,
        author: {
          username: data.username,
          displayName: data.username,
        },
        stats: {
          likes: data.like_count,
          comments: data.comments_count,
          shares: 0, // Instagram API doesn't provide share count
        },
      };
    } catch (error) {
      console.error('Error fetching Instagram post:', error);
      throw new Error('Failed to fetch Instagram post data');
    }
  },

  async parseTikTokData(data: TikTokVideoData): Promise<SocialRecipe> {
    // Use AI to analyze the video description and extract recipe information
    const recipeData = await aiService.parseRecipeFromText(data.description);
    return {
      ...recipeData,
      source: 'tiktok',
      sourceUrl: data.videoUrl,
      imageUrl: data.thumbnailUrl,
    };
  },

  async parseInstagramData(data: InstagramPostData): Promise<SocialRecipe> {
    // Use AI to analyze the post caption and extract recipe information
    const recipeData = await aiService.parseRecipeFromText(data.caption);
    return {
      ...recipeData,
      source: 'instagram',
      sourceUrl: data.mediaUrl,
      imageUrl: data.mediaUrl,
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
      tiktok: Platform.select({
        ios: 'tiktok://',
        android: 'tiktok://',
        default: 'https://tiktok.com',
      }),
      instagram: Platform.select({
        ios: 'instagram://',
        android: 'instagram://',
        default: 'https://instagram.com',
      }),
    };

    const url = urls[platform];
    if (!url) {
      throw new Error('Unsupported platform');
    }

    const success = await this.openSocialApp(url);
    if (!success) {
      throw new Error('Failed to open app. Please make sure it is installed.');
    }
  },
};
