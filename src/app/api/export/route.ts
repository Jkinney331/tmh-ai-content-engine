import { NextResponse } from 'next/server';

const JSZip = require('jszip');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || !Array.isArray(content) || content.length === 0) {
      return NextResponse.json(
        { error: 'Content array is required' },
        { status: 400 }
      );
    }

    // Create zip file
    const zip = new JSZip();

    // Create folders
    const imagesFolder = zip.folder('images');
    const videosFolder = zip.folder('videos');
    const captionsFolder = zip.folder('captions');

    // Process each content item
    for (let index = 0; index < content.length; index++) {
      const item = content[index];
      const cityName = (item.city || 'unknown').toLowerCase().replace(/\s+/g, '_');
      const date = new Date(item.created_at).toISOString().split('T')[0];
      const contentType = item.content_type || 'content';

      // Generate filename following the pattern: {city}_{content_type}_{date}_{index}.{ext}
      const baseFilename = `${cityName}_${contentType}_${date}_${index + 1}`;

      // Fetch content data from URL
      try {
        if (item.output_url) {
          const response = await fetch(item.output_url);
          if (!response.ok) {
            console.error(`Failed to fetch content: ${item.output_url}`);
            continue;
          }

          const blob = await response.blob();
          const buffer = await blob.arrayBuffer();

          // Determine file extension based on content type
          let extension = '.jpg';
          let isVideo = false;

          if (item.content_type === 'video_ad' || item.output_url.includes('.mp4')) {
            extension = '.mp4';
            isVideo = true;
          } else if (item.output_url.includes('.png')) {
            extension = '.png';
          } else if (item.output_url.includes('.webp')) {
            extension = '.webp';
          } else if (item.output_url.includes('.gif')) {
            extension = '.gif';
          }

          // Add content to appropriate folder
          if (isVideo) {
            videosFolder?.file(`${baseFilename}${extension}`, buffer);
          } else {
            imagesFolder?.file(`${baseFilename}${extension}`, buffer);
          }

          // Generate caption text file
          const captionContent = generateCaption(item, cityName, date, index + 1);
          captionsFolder?.file(`${baseFilename}.txt`, captionContent);

          // Handle thumbnails for videos
          if (item.metadata?.thumbnail) {
            try {
              const thumbResponse = await fetch(item.metadata.thumbnail);
              if (thumbResponse.ok) {
                const thumbBlob = await thumbResponse.blob();
                const thumbBuffer = await thumbBlob.arrayBuffer();
                imagesFolder?.file(`${baseFilename}_thumbnail.jpg`, thumbBuffer);
              }
            } catch (thumbError) {
              console.error('Error fetching thumbnail:', thumbError);
            }
          }
        }
      } catch (fetchError) {
        console.error(`Error processing item ${item.id}:`, fetchError);
        continue;
      }
    }

    // Generate export metadata
    const exportMetadata = {
      exportDate: new Date().toISOString(),
      totalItems: content.length,
      cities: Array.from(new Set(content.map(i => i.city || 'unknown'))),
      contentTypes: Array.from(new Set(content.map(i => i.content_type || 'unknown')))
    };

    // Add metadata file to zip
    zip.file('export_metadata.json', JSON.stringify(exportMetadata, null, 2));

    // Generate the zip file
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });

    // Convert blob to base64 for data URL
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });

    reader.readAsDataURL(zipBlob);
    const base64Data = await base64Promise;

    // Create a data URL for download
    const downloadUrl = `data:application/zip;base64,${base64Data}`;

    // Return the download URL in the response
    return NextResponse.json({
      success: true,
      downloadUrl,
      itemsExported: content.length,
      metadata: exportMetadata,
      message: 'Content exported successfully'
    });

  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during export' },
      { status: 500 }
    );
  }
}

function generateCaption(item: any, cityName: string, date: string, index: number): string {
  const lines: string[] = [];

  // Title
  const formattedCity = cityName.replace(/_/g, ' ').toUpperCase();
  const contentType = (item.content_type || 'content').replace(/_/g, ' ').toUpperCase();
  lines.push(`TMH ${formattedCity} - ${contentType}`);
  lines.push('═'.repeat(50));
  lines.push('');

  // File info
  lines.push(`File: ${cityName}_${item.content_type}_${date}_${index}`);
  lines.push(`City: ${item.city || 'Unknown'}`);
  lines.push(`Type: ${item.content_type || 'Unknown'}`);
  lines.push(`Status: ${item.status || 'Unknown'}`);
  lines.push(`Created: ${new Date(item.created_at).toLocaleDateString()}`);
  lines.push('');

  // AI Generation details
  if (item.prompt) {
    lines.push('PROMPT USED:');
    lines.push('-'.repeat(30));
    lines.push(item.prompt);
    lines.push('');
  }

  if (item.model) {
    lines.push(`Model: ${item.model}`);
    lines.push('');
  }

  // Metadata details (captions, scripts, etc.)
  if (item.metadata?.caption) {
    lines.push('CAPTION:');
    lines.push('-'.repeat(30));
    lines.push(item.metadata.caption);
    lines.push('');
  }

  if (item.metadata?.script) {
    lines.push('VIDEO SCRIPT:');
    lines.push('-'.repeat(30));
    lines.push(item.metadata.script);
    lines.push('');
  }

  // Social media caption template
  lines.push('SUGGESTED SOCIAL MEDIA CAPTION:');
  lines.push('-'.repeat(30));

  if (item.metadata?.caption) {
    lines.push(item.metadata.caption);
  } else {
    lines.push(`🔥 ${formattedCity} vibes only! 💯`);
  }

  lines.push('');
  lines.push('#TMH #TheMoreYouHate #' + formattedCity.replace(/\s+/g, ''));
  lines.push('#UrbanStyle #Streetwear #LocalPride');
  lines.push('');

  // Footer
  lines.push('═'.repeat(50));
  lines.push('© TMH - The More You Hate');
  lines.push('www.themoreyouhate.com');

  return lines.join('\n');
}