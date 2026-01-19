"""
Utility functions for courses app
"""
import re
import requests
from urllib.parse import urlparse, parse_qs


def convert_youtube_to_streamable(youtube_url):
    """
    Convert YouTube URL to a format that can be used with expo-video.
    This uses YouTube's iframe player which should work with WebView.
    
    For direct streaming, you would need to:
    1. Host videos on your own server/CDN
    2. Use a service like Cloudinary or AWS S3
    3. Use Vimeo which provides direct URLs
    """
    # Extract video ID from various YouTube URL formats
    video_id = None
    
    # Pattern 1: https://www.youtube.com/watch?v=VIDEO_ID
    # Pattern 2: https://youtu.be/VIDEO_ID
    # Pattern 3: https://www.youtube.com/embed/VIDEO_ID
    
    if 'youtu.be/' in youtube_url:
        video_id = youtube_url.split('youtu.be/')[-1].split('?')[0].split('&')[0]
    elif 'youtube.com/watch' in youtube_url:
        parsed = urlparse(youtube_url)
        video_id = parse_qs(parsed.query).get('v', [None])[0]
    elif 'youtube.com/embed/' in youtube_url:
        video_id = youtube_url.split('embed/')[-1].split('?')[0]
    
    if not video_id:
        return youtube_url
    
    # Return YouTube embed URL which works with WebView
    # Note: This still won't work with expo-video's VideoView
    return f"https://www.youtube.com/embed/{video_id}"


def get_youtube_video_id(url):
    """Extract video ID from YouTube URL"""
    if 'youtu.be/' in url:
        return url.split('youtu.be/')[-1].split('?')[0].split('&')[0]
    elif 'youtube.com/watch' in url:
        parsed = urlparse(url)
        return parse_qs(parsed.query).get('v', [None])[0]
    elif 'youtube.com/embed/' in url:
        return url.split('embed/')[-1].split('?')[0]
    return None
