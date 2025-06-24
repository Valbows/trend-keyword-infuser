# YouTube Engagement Recording Feature

## Overview

The YouTube Engagement Recording feature allows users to associate their scripts with published YouTube videos and automatically track engagement metrics including views, likes, comments, and calculated engagement rates.

## Features

### Automatic Metrics Collection
- **Views**: Total video view count
- **Likes**: Total video like count  
- **Comments**: Total video comment count
- **Engagement Rate**: Calculated as `(likes + comments) / views * 100`

### Supported YouTube URL Formats
The system accepts YouTube URLs in multiple formats:
- Standard: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short: `https://youtu.be/VIDEO_ID`
- Embed: `https://www.youtube.com/embed/VIDEO_ID`
- Mobile: `https://m.youtube.com/watch?v=VIDEO_ID`

### Conflict Resolution
If a YouTube video is already associated with another script, the system will automatically reassign it to the new script to prevent duplicate associations.

## How to Use

### Recording Engagement for a Script

1. **Navigate to Your Scripts**: Go to the script management section of the application
2. **Locate Your Script**: Find the script you want to associate with a YouTube video
3. **Enter YouTube URL**: In the engagement section, paste the YouTube video URL
4. **Submit**: Click the "Record Engagement" button
5. **View Results**: The engagement metrics will be displayed automatically

### Understanding Engagement Metrics

#### Views
The total number of times the video has been watched. This includes both unique and repeat views.

#### Likes
The total number of users who have liked the video. This is a key indicator of positive audience response.

#### Comments
The total number of comments left on the video. Comments indicate active audience engagement and discussion.

#### Engagement Rate
A calculated percentage that represents how actively engaged viewers are with your content:
- **Formula**: `(Likes + Comments) ÷ Views × 100`
- **Interpretation**:
  - 0-2%: Low engagement
  - 2-5%: Average engagement
  - 5-10%: Good engagement
  - 10%+: Excellent engagement

## Technical Requirements

### Prerequisites
- YouTube video must be public
- Video statistics must be enabled
- Valid YouTube Data API access

### Limitations
- Private videos cannot be tracked
- Videos with disabled statistics will not return data
- API rate limits may apply for high-volume usage

## Error Handling

### Common Error Messages

#### "Invalid YouTube URL provided"
- **Cause**: The URL format is not recognized as a valid YouTube URL
- **Solution**: Ensure you're using a supported YouTube URL format

#### "Could not retrieve video statistics"
- **Cause**: Video may be private, deleted, or have statistics disabled
- **Solution**: Verify the video is public and statistics are enabled

#### "Script not found"
- **Cause**: The script ID is invalid or the script has been deleted
- **Solution**: Refresh the page and try again, or contact support

#### "An unexpected error occurred"
- **Cause**: Internal system error or temporary service unavailability
- **Solution**: Wait a moment and try again, or contact support if the issue persists

## Best Practices

### When to Record Engagement
- **Initial Publication**: Record engagement shortly after publishing your video
- **Regular Updates**: Check engagement periodically to track performance trends
- **Campaign Analysis**: Record engagement at key campaign milestones

### Optimizing Engagement Rates
- **Content Quality**: Focus on creating valuable, relevant content
- **Call-to-Actions**: Encourage viewers to like and comment
- **Community Engagement**: Respond to comments to foster discussion
- **Timing**: Publish when your audience is most active

### Data Interpretation
- **Context Matters**: Consider video age, topic, and audience when interpreting metrics
- **Trends Over Time**: Look at engagement patterns across multiple videos
- **Comparative Analysis**: Compare similar content types for insights

## Privacy and Security

### Data Protection
- Engagement data is stored securely in your account
- Only you can access your script's engagement metrics
- Data is encrypted in transit and at rest

### YouTube API Compliance
- All data collection follows YouTube's Terms of Service
- Only public video statistics are accessed
- No personal viewer information is collected

## Troubleshooting

### Video Not Found
1. Verify the YouTube URL is correct
2. Check if the video is public
3. Ensure the video hasn't been deleted
4. Try copying the URL directly from the YouTube video page

### Metrics Not Updating
1. Check if sufficient time has passed since last update
2. Verify the video statistics are enabled
3. Ensure your internet connection is stable
4. Try refreshing the page and recording again

### Duplicate Video Associations
The system automatically handles this by reassigning videos to the most recent script. This ensures each video is only associated with one script at a time.

## Support

### Getting Help
- **Documentation**: Refer to this guide for common questions
- **Error Messages**: Read error messages carefully for specific guidance
- **Contact Support**: Reach out to our support team for technical issues

### Reporting Issues
When reporting issues, please include:
- The YouTube URL you're trying to use
- The exact error message received
- Steps you took before encountering the issue
- Your browser and operating system information

## API Reference

For developers integrating with the engagement recording system, see the [API Documentation](../backend/docs/api/engagement-recording.yaml) for detailed endpoint specifications and examples.
